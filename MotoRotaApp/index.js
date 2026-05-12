/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// react-native-screens optimizasyonu - NavigationContainer'dan once cagrilmali
enableScreens();

AppRegistry.registerComponent(appName, () => App);
