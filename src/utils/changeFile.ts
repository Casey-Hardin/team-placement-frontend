import { sendFile } from "adaptors/send_file";

async function handleChangeFile<T>(
  endpoint: string,
  input: React.RefObject<HTMLInputElement>,
  extensions: string[],
  files: FileList | null,
) : Promise<T[]> {
  /*
  Collects a file based on user selection.

  endpoint
    Address on the backend to send the file.
  input
    Reference to input field that accepted the file.
  extensions
    List of allowable extensions.
  files
    List of files selected by the user.

  T[]
    Objects parsed from file.
  */
  // a file must be selected
  // only the first selected file is used
  if (files === null) {
    console.log("No files selected!");
    return [];
  }
  const file = files[0];
  console.log(`File "${file.name}" Selected!`);

  // single selection only - allows for selecting the same file again on a successive click
  if (input.current !== null) {
    input.current.value = "";
  }

  // file must have an allowed extension
  if (!extensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    alert(`Imported files must have extension in \n${extensions}.`);
    return [];
  }

  // read file
  const [data, success] = await sendFile<T>(endpoint, file);
  if (!success || data === null) {
    const message = `File ${file.name} could not be read!`;
    alert(message);
    return [];
  }

  // return file contents
  alert(`File ${file.name} read successfully!`);
  return data;
}

export {
  handleChangeFile,
}