// src/components/WelcomeHomeUser.js
import React from 'react'; // Kita akan buat file CSS ini nanti

const WelcomeHomeUser = ({ user, onExploreClick }) => {
    return (
        <div className="welcome-card-container">

            <h2>Welcome to Your Ticket {user}!</h2>
            <div className="welcome-card">
                <p>
                    Need Help? This platform is designed to simplify your daily tasks
                    and improve efficiency. If you encounter any issues, you can:
                </p>
                <ul className="welcome-list">
                    <li>Create and manage support tickets according to your needs.</li>
                    <li>Track the progress of your tickets in real time.</li>
                    <li>Review a complete history of all your past requests.</li>
                </ul>
                <p>
                    Our user-friendly interface ensures that you can easily submit a new request
                    or monitor the status of an existing one. Use the navigation menu above to get started.
                </p>
                <p>
                    If you have any further questions or need additional support, don’t hesitate
                    to contact our support team. We are here to help you get the most out of our service.
                </p>
                <button onClick={onExploreClick} className="explore-button">
                    Explore
                </button>
            </div>
        </div>
    );
};

export default WelcomeHomeUser;