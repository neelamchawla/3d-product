/* eslint-disable react/prop-types */
import { TwitterPicker } from 'react-color';
import { useSnapshot } from 'valtio';
import state from '../store';

const ColorPicker = ({ open }) => {
  const snap = useSnapshot(state);

  return (
    <>
      {open && (
        <div
          className="absolute left-full ml-4 color-picker-panel"
          role="region"
          aria-label="Color picker"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle mb-2 px-1">
            Shirt color
          </p>
          <TwitterPicker
            triangle="hide"
            color={snap.color}
            disableAlpha
            onChange={(color) => {
              if (color?.hex) {
                state.color = color.hex;
              }
            }}
            width="200px"
          />
        </div>
      )}
    </>
  );
};

export default ColorPicker;
