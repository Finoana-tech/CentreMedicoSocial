import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsCheckCircle, BsXCircle, BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs';

const icons = {
  success: <BsCheckCircle size={50} className="mb-3" />,
  danger: <BsXCircle size={50} className="mb-3" />,
  warning: <BsExclamationTriangle size={50} className="mb-3" />,
  info: <BsInfoCircle size={50} className="mb-3" />,
};

const textColors = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

const ConfirmationModal = ({ show, type = 'info', message, onClose, onConfirm }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center bg-white">
        <div>{icons[type]}</div>
        <p className={`fs-5 ${textColors[type]}`}>{message}</p>
        <div className="d-flex justify-content-center mt-3">
          {onConfirm && (
            <Button
              variant={type === 'danger' ? 'danger' : 'primary'}
              className="me-2"
              onClick={onConfirm}
            >
              Confirmer
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;
