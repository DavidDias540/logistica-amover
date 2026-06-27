import React from 'react';

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          buttonBg: 'bg-black hover:bg-gray-800 text-white',
          iconBg: 'bg-green-100 text-green-600'
        };
      case 'error':
        return {
          icon: '✕',
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          buttonBg: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100 text-red-600'
        };
      default:
        return {
          icon: 'ℹ',
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconBg: 'bg-blue-100 text-blue-600'
        };
    }
  };

  const styles = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-xl max-w-sm w-full mx-4`}>
        <div className="p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <span className="font-semibold text-lg">{styles.icon}</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                {title}
              </h3>
              <p className={`mt-1 text-sm ${styles.messageColor}`}>
                {message}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${styles.buttonBg}`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
