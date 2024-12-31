import { BACKEND_ADDRESS } from "localConstants";

async function sendFile<T>(endpoint: string, file: File) : Promise<[T[] | null, boolean]> {
  /*
  Sends file object to the workspace.

  endpoint
    Endpoint on the backend to send the file.
  file
    File to save to the workspace.

  T[] | null
    Data read from the file and assigned on the workspace.
  boolean
    True if the file saved successfully on the workspace otherwise False.
  */
  // send the file as form data over the body of the HTTP request
  const payload = new FormData();
  payload.append("file", file);

  // communicate with backend
  const response = await fetch(`${BACKEND_ADDRESS}/${endpoint}`, {
    method: "POST",
    body: payload,
    },
  );

  // handle error message
  if (!response.ok) {
    const details = await response.json();
    console.log(details.detail.message);
    alert(details.detail.message);
    return [null, response.ok]
  }

  // return objects and success status
  const result = await response.json();
  return [result, response.ok];
}

export { sendFile };