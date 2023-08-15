/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import React, {Suspense, use} from 'react';
import {View, Text} from 'react-native';

const fetchComments = async () => {
  const request = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  console.log('f');
  return await request.json();
};

const ComponentWithUse = () => {
  const {title} = use(fetchComments());

  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

const AsyncComponent = async () => {
  const {title} = await fetchComments();

  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

const RNTesterExampleFilter = () => {
  return (
    <View>
      <Suspense>
        {/* <ComponentWithUse /> */}
        <AsyncComponent />
      </Suspense>
    </View>
  );
};

module.exports = RNTesterExampleFilter;
