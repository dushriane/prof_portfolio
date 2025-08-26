export const NotificationSystem = () => {
  return (
    <div className="notification-container">
      <div className="notification success">
        <i className="fas fa-check-circle"></i>
        <span>Success message</span>
        <button className="close-btn">×</button>
      </div>
    </div>
  );
};