/* eslint-disable react/prop-types */
// import React from 'react';
// import { SketchPicker } from 'react-color';
// import { CirclePicker } from 'react-color';
import { TwitterPicker  } from 'react-color';
import { useSnapshot } from 'valtio';
import state from '../store';

const ColorPicker = ({ open }) => {
  const snap = useSnapshot(state);
  return (
    <>
      {/* If open is true show your <div /> */}
      {open && (
        <div className="absolute left-full ml-3">
          <TwitterPicker
            triangle='hide'
            color={snap.color}
            disableAlpha
            onChange={(color) => state.color = color.hex}
            width={'135px'}
            // only in sketchPicker
            // presetColors={[
            //   {color: '#f00', title: 'red'}
            // ]}
          />
        </div>
      )}
    </>
    // <>ColorPicker</>
  )
}

export default ColorPicker;