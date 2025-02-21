import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SuccessPage } from './Success';
import { FailPage } from './Fail';
import { CheckoutPage } from './Checkout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/fail" element={<FailPage />} />
      </Routes>
    </Router>
  );
}

export default App;