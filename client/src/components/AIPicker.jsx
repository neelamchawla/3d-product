/* eslint-disable react/prop-types */

import CustomButton from './CustomButton';

const AIPicker = ({ open, prompt, setPrompt, generatingImg, handleSubmit }) => {
  return (
    <>
      {open && (
        <div className="aipicker-container">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            AI generator
          </p>
          <label htmlFor="ai-prompt" className="sr-only">
            AI image prompt
          </label>
          <textarea
            id="ai-prompt"
            placeholder="Describe your design… e.g. a sunset over mountains"
            rows={5}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="aipicker-textarea"
            aria-busy={generatingImg}
            maxLength={500}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="AI generation options">
            {generatingImg ? (
              <CustomButton
                type="outline"
                title="Generating…"
                customStyles="text-xs w-full"
                disabled
              />
            ) : (
              <>
                <CustomButton
                  type="outline"
                  title="AI Logo"
                  handleClick={() => handleSubmit('logo')}
                  customStyles="text-xs"
                />

                <CustomButton
                  type="filled"
                  title="AI Full"
                  handleClick={() => handleSubmit('full')}
                  customStyles="text-xs"
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIPicker;
