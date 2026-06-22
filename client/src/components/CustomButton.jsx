import { useSnapshot } from 'valtio';

import state from '../store';
import { getContrastingColor } from '../config/helpers';

// eslint-disable-next-line react/prop-types
const CustomButton = ({ type, title, customStyles, handleClick, disabled, ariaLabel }) => {
  const snap = useSnapshot(state);

  const generateStyle = (buttonType) => {
    if (buttonType === 'filled') {
      return {
        backgroundColor: snap.color,
        color: getContrastingColor(snap.color),
      };
    }

    if (buttonType === 'outline') {
      return {
        borderColor: snap.color,
        color: snap.color,
      };
    }

    return {};
  };

  const variantClass = type === 'filled' ? 'btn-filled' : 'btn-outline';

  return (
    <button
      type="button"
      className={`${variantClass} ${customStyles ?? ''}`}
      style={generateStyle(type)}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel ?? title}
      aria-disabled={disabled || undefined}
    >
      {title}
    </button>
  );
};

export default CustomButton;
