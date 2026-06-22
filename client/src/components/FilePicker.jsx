/* eslint-disable react/prop-types */

import CustomButton from './CustomButton';

const MAX_FILE_SIZE_MB = 5;

const FilePicker = ({ open, file, setFile, readFile }) => {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile('');
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      event.target.value = '';
      setFile('');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      setFile('');
      return;
    }

    setFile(selectedFile);
  };

  return (
    <>
      {open && (
        <div className="filepicker-container">
          <div className="flex-1 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle mb-2">
              Upload design
            </p>
            <label htmlFor="file-upload" className="filepicker-label">
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              aria-describedby="file-upload-status"
            />

            <p id="file-upload-status" className="filepicker-status">
              {file === '' ? 'No file selected yet' : file.name}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <CustomButton
              type="outline"
              title="Logo"
              handleClick={() => readFile('logo')}
              customStyles="text-xs"
              disabled={!file}
            />
            <CustomButton
              type="filled"
              title="Full"
              handleClick={() => readFile('full')}
              customStyles="text-xs"
              disabled={!file}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FilePicker;
