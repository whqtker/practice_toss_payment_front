import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

interface ResponseData {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  requestedAt: string;
  approvedAt: string;
  totalAmount: number;
  balanceAmount: number;
  method: string;
}

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [responseData, setResponseData] = useState<ResponseData | null>(null);

  useEffect(() => {
    async function confirm() {
      const amount = Number(searchParams.get("amount"));
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const missingId = localStorage.getItem('missingId'); // missingId 저장
    
      // 값 검증
      if (!orderId || !amount || !paymentKey) {
        throw { message: "Missing required parameters", code: "INVALID_REQUEST" };
      }

      // amount와 setAmount()의 amount 파라미터가 일치하는지 확인해야 함
    
      // 요청 데이터 로깅
      console.log("Request data:", {
        orderId,
        amount,
        paymentKey,
        missingId
      });
    
      const requestData = {
        orderId,
        amount,
        paymentKey,
        missingId
      };
    
      try {
        // 서버로 결제 정보 전달
        const response = await fetch("http://localhost:8080/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw {
            message: errorData.message || "결제 처리 중 오류가 발생했습니다",
            code: errorData.code || "PAYMENT_ERROR"
          };
        }
    
        const json = await response.json();
        localStorage.removeItem('missingId'); // 사용 후 삭제
        return json;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    }

    confirm()
      .then((data) => {
        setResponseData(data);
      })
      .catch((error) => {
        navigate(`/fail?code=${error.code}&message=${error.message}`);
      });
  }, [searchParams, navigate]);

  return (
    <>
      <div className="box_section" style={{ width: "600px" }}>
        <img
          width="100px"
          src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
          alt="결제 완료 이미지"
        />
        <h2>결제를 완료했어요</h2>
        <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
          <div className="p-grid-col text--left">
            <b>결제금액</b>
          </div>
          <div className="p-grid-col text--right" id="amount">
            {`${Number(searchParams.get("amount")).toLocaleString()}원`}
          </div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
          <div className="p-grid-col text--left">
            <b>주문번호</b>
          </div>
          <div className="p-grid-col text--right" id="orderId">
            {`${searchParams.get("orderId")}`}
          </div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
          <div className="p-grid-col text--left">
            <b>paymentKey</b>
          </div>
          <div className="p-grid-col text--right" id="paymentKey" style={{ whiteSpace: "initial", width: "250px" }}>
            {`${searchParams.get("paymentKey")}`}
          </div>
        </div>
        <div className="p-grid-col">
          <Link to="/">
            <button className="button p-grid-col5" style={{ backgroundColor: "#3182f6", color: "#ffffff" }}>
              메인 페이지로 이동
            </button>
          </Link>
          {/* <Link to="https://docs.tosspayments.com/guides/v2/payment-widget/integration">
            <button className="button p-grid-col5">연동 문서</button>
          </Link>
          <Link to="https://discord.gg/A4fRFXQhRu">
            <button className="button p-grid-col5" style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}>
              실시간 문의
            </button>
          </Link> */}
        </div>
      </div>
      <div className="box_section" style={{ width: "600px", textAlign: "left" }}>
        <b>Response Data :</b>
        <div id="response" style={{ whiteSpace: "initial" }}>
          {responseData && <pre>{JSON.stringify(responseData, null, 4)}</pre>}
        </div>
      </div>
    </>
  );
};
