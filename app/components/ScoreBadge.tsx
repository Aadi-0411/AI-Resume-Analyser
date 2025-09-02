import React from 'react';

// Define the type for the component's props for strong type-checking.
interface ScoreBadgeProps {
    score: number;
}

/**
 * A reusable React component that displays a styled badge with a label
 * based on a numerical score. The color and text are dynamic.
 * - Score > 70: "Strong" (Green)
 * - Score > 49: "Good Start" (Yellow)
 * - Otherwise: "Needs Work" (Red)
 * @param {ScoreBadgeProps} props - The component props.
 * @param {number} props.score - The numerical score to evaluate.
 */
const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    let badgeStyle = '';
    let label = '';

    // Determine the badge style and label based on the score prop.
    if (score > 70) {
        badgeStyle = 'bg-green-100 text-green-700';
        label = 'Strong';
    } else if (score > 49) {
        badgeStyle = 'bg-yellow-100 text-yellow-700';
        label = 'Good Start';
    } else {
        badgeStyle = 'bg-red-100 text-red-700';
        label = 'Needs Work';
    }

    // Combine base styles with the dynamic style.
    const baseStyles = 'px-3 py-1 rounded-full font-semibold text-sm inline-block';

    return (
        <div className={`${baseStyles} ${badgeStyle}`}>
            <p>{label}</p>
        </div>
    );
};

export default ScoreBadge;
