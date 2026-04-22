import {
  handleAirtimeSendPost,
  handleAirtimeStatusPost,
  handleAirtimeValidatePost,
} from './shared-handlers';

export async function sendAirtime(body: unknown) {
  return handleAirtimeSendPost(body);
}

export async function validateAirtime(body: unknown) {
  return handleAirtimeValidatePost(body);
}

export async function airtimeStatusCallback(fields: {
  requestId?: string | null;
  status?: string | null;
}) {
  return handleAirtimeStatusPost(fields);
}
