import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useState } from "react";

// Client key and customer key setup
const clientKey: string = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey: string = generateRandomString();

interface Amount {
  currency: string;
  value: number;
}

export const CheckoutPage: React.FC = () => {
  const [amount, setAmount] = useState<Amount>({ currency: "KRW", value: 0 });
  const [ready, setReady] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<any>(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        // 클라이언트 키로 결제 위젯 초기화 -> 토스페이먼츠 객체가 생성됨
        const tossPayments = await loadTossPayments(clientKey);

        // 초기화된 토스페이먼츠 객체로 widgets() 호출 -> 결제 위젯 객체가 생성됨
        // 파라미터로 customerKey를 전달, 비회원은 ANONYMOUS 상수 전달
        const widgets = tossPayments.widgets({ customerKey });
        setWidgets(widgets);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (!widgets) return;

      await widgets.setAmount(amount);
      
      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      await widgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, amount]);

  useEffect(() => {
    async function fetchMissingAmount() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const missingId = urlParams.get('missingId');
        
        if (!missingId) {
          throw new Error('Missing ID is required');
        }

        const response = await fetch(`http://localhost:8080/pay/amount/${missingId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch payment amount');
        }

        const data = await response.json();
        setAmount({ currency: "KRW", value: data.amount });
        
        localStorage.setItem('missingId', missingId);
      } catch (error) {
        console.error('Error fetching payment amount:', error);
      }
    }

    fetchMissingAmount();
  }, []);

  const updateAmount = async (newAmount: Amount) => {
    setAmount(newAmount);

    // 결제 위젯의 setAmount() 호출로 결제 금액 세팅
    // 쿠폰 등으로 결제 금액 업데이트 시에도 setAmount() 호출
    await widgets.setAmount(newAmount);
  };

  const [missingId, setMissingId] = useState<string | null>(null);

  useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('missingId');
      setMissingId(id);
  }, []);

  return (
    <div className="wrapper">
      <div className="box_section">
        <div id="payment-method" />
        <div id="agreement" />
        <div style={{ paddingLeft: "24px" }}>
          <div className="checkable typography--p">
            <label htmlFor="coupon-box" className="checkable__label typography--regular">
              <input
                id="coupon-box"
                className="checkable__input"
                type="checkbox"
                aria-checked="true"
                disabled={!ready}
                onChange={async (event) => {
                  await updateAmount({
                    currency: amount.currency,
                    value: event.target.checked ? amount.value - 5000 : amount.value + 5000,
                  });
                }}
              />
              <span className="checkable__label-text">5,000원 쿠폰 적용</span>
            </label>
          </div>
        </div>

        <button
          className="button"
          style={{ marginTop: "30px" }}
          disabled={!ready}
          onClick={async () => {
            try {
              await widgets.requestPayment({
                  orderId: generateRandomString(),
                  orderName: `실종자 신고 포상금 (ID: ${missingId})`,
                  successUrl: window.location.origin + "/success",
                  failUrl: window.location.origin + "/fail",
                  customerEmail: "customer123@gmail.com",
                  customerName: "김토스",
                  customerMobilePhone: "01012341234",
               });
              } catch (error) {
                  console.error(error);
              }
          }}
        >
          결제하기
        </button>
      </div>
    </div>
  );
};

function generateRandomString(): string {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
