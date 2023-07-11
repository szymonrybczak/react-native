/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import type {RequestBody} from './convertRequestBody';

import RCTDeviceEventEmitter from '../EventEmitter/RCTDeviceEventEmitter';
import convertRequestBody from './convertRequestBody';
import NativeNetworkingAndroid from './NativeNetworkingAndroid';

type Header = [string, string];

// Convert FormData headers to arrays, which are easier to consume in
// native on Android.
function convertHeadersMapToArray(headers: Object): Array<Header> {
  const headerArray: Array<Header> = [];
  for (const name in headers) {
    headerArray.push([name, headers[name]]);
  }
  return headerArray;
}

let _requestId = 1;
function generateRequestId(): number {
  return _requestId++;
}

type RCTNetworkingEventDefinitions = $ReadOnly<{
  didSendNetworkData: [
    [
      number, // requestId
      number, // progress
      number, // total
    ],
  ],
  didReceiveNetworkResponse: [
    [
      number, // requestId
      number, // statusCode
      ?{[string]: string}, // headers
      ?string, // url
    ],
  ],
  didReceiveNetworkData: [
    [
      number, // requestId
      string, // data
    ],
  ],
  didReceiveNetworkIncrementalData: [
    [
      number, // requestId
      string, // data
      number, // progress
      number, // total
    ],
  ],
  didReceiveNetworkDataProgress: [
    [
      number, // requestId
      number, // progress
      number, // total
    ],
  ],
  didCompleteNetworkResponse: [
    [
      number, // requestId
      string, // error
      ?boolean, // timeOutError
    ],
  ],
}>;

const RCTNetworking = {
  addListener<K: $Keys<RCTNetworkingEventDefinitions>>(
    eventType: K,
    listener: (...$ElementType<RCTNetworkingEventDefinitions, K>) => mixed,
    context?: mixed,
  ): EventSubscription {
    // $FlowFixMe[incompatible-call]
    return RCTDeviceEventEmitter.addListener(eventType, listener, context);
  },
  sendRequest(
    method: string,
    trackingName: string,
    url: string,
    headers: Object,
    data: RequestBody,
    responseType: 'text' | 'base64',
    incrementalUpdates: boolean,
    timeout: number,
    callback: (requestId: number) => mixed,
    withCredentials: boolean,
  ) {
    const body = convertRequestBody(data);
    if (body && body.formData) {
      body.formData = body.formData.map(part => ({
        ...part,
        headers: convertHeadersMapToArray(part.headers),
      }));
    }
    const requestId = generateRequestId();
    NativeNetworkingAndroid.sendRequest(
      method,
      url,
      requestId,
      convertHeadersMapToArray(headers),
      {...body, trackingName},
      responseType,
      incrementalUpdates,
      timeout,
      withCredentials,
    );
    callback(requestId);
  },
  abortRequest(requestId: number) {
    NativeNetworkingAndroid.abortRequest(requestId);
  },
  clearCookies(callback: (result: boolean) => void) {
    NativeNetworkingAndroid.clearCookies(callback);
  },
};

export default RCTNetworking;
