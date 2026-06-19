import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { BsCheckCircle, BsExclamationTriangle, BsXCircle, BsInfoCircle } from 'react-icons/bs';
import './NotificationToast.css'; 
const icons = {
  success: <BsCheckCircle className="me-2" />,
  warning: <BsExclamationTriangle className="me-2" />,
  danger: <BsXCircle className="me-2" />,
  info: <BsInfoCircle className="me-2" />,
};

const NotificationToast = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <Modal
      show={visible}
      onHide={() => { setVisible(false); onClose && onClose(); }}
      centered
      backdrop={false}
      keyboard={false}
      contentClassName="p-3 rounded-4 border-0 shadow toast-modal"
    >
      <div className={`toast-content text-center bg-white p-4 rounded-4`}>
        <div className="d-flex align-items-center justify-content-center mb-2">
          {icons[type]}
          <h5 className={`m-0 text-${type}`}>{type.toUpperCase()}</h5>
        </div>
        <p className={`text-${type} mb-0`}>{message}</p>
      </div>
    </Modal>
  );
};

export default NotificationToast;
