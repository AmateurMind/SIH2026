import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value, onChange, readOnly = false, max = 10, size = 24 }) => {
    const [hoverValue, setHoverValue] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(max)].map((_, index) => {
                const ratingValue = index + 1;
                const filled = hoverValue >= ratingValue || value >= ratingValue;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readOnly}
                        className={`transition-colors duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                        onClick={() => !readOnly && onChange(ratingValue)}
                        onMouseEnter={() => !readOnly && setHoverValue(ratingValue)}
                        onMouseLeave={() => !readOnly && setHoverValue(0)}
                    >
                        <Star
                            size={size}
                            className={`${filled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-transparent text-gray-300'
                                }`}
                        />
                    </button>
                );
            })}
            <span className="ml-2 text-sm font-medium text-gray-600 min-w-[2rem]">
                {value > 0 ? value : 0}/{max}
            </span>
        </div>
    );
};

export default StarRating;
