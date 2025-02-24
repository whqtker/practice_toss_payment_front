import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useState } from "react";

// clientKey, customerKey 세팅
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
        // 파라미터로 customerKey를, 비회원은 ANONYMOUS 상수를 전달하면 됨
        const widgets = tossPayments.widgets({ customerKey });

        // 생성된 위젯 객체를 state에 저장
        setWidgets(widgets);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      // 결제 위젯이 준비되지 않았다면 렌더링하지 않음
      if (!widgets) return;

      // 설정된 금액을 위젯에 적용
      await widgets.setAmount(amount);
      
      // DOM 요소에 결제 수단, 약관 위젯 렌더링
      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      await widgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      // 위젯이 성공적으로 렌더링되면 ready 상태를 true로 설정
      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, amount]);

  useEffect(() => {
    async function fetchAmount() {
      try {
        // URL 파라미터에서 amount 추출
        const urlParams = new URLSearchParams(window.location.search);
        const amount = urlParams.get('amount');
        
        if (!amount) {
          throw new Error('Amount is required');
        }

        // amount를 정수로 변환하여 state에 저장
        setAmount({ currency: "KRW", value: parseInt(amount) });
      } catch (error) {
        console.error('Error setting payment amount:', error);
      }
    }

    fetchAmount();
  }, []);

  const updateAmount = async (newAmount: Amount) => {
    setAmount(newAmount);

    // 결제 위젯의 setAmount() 호출로 결제 금액 세팅
    // 쿠폰 등으로 결제 금액 업데이트 시에도 setAmount() 호출
    await widgets.setAmount(newAmount);
  };

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
                orderName: `결제 금액: ${amount.value}원`,
                successUrl: window.location.origin + "/success",
                failUrl: window.location.origin + "/fail",
                customerEmail: "customer123@gmail.com",
                customerName: "김토스",
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
