import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {PeopleList} from './screens/PeopleList';
import {PersonDetails} from './screens/PersonDetails';
import {Settings} from './screens/Settings';
import {Intro} from './screens/Intro';
import messaging from '@react-native-firebase/messaging';
import {Alert, Linking} from 'react-native';

const PeopleStack = createStackNavigator();
const People = () => (
  <PeopleStack.Navigator>
    <PeopleStack.Screen name="People" component={PeopleList} />
    <PeopleStack.Screen
      name="PersonDetails"
      component={PersonDetails}
      options={() => ({
        title: '',
      })}
    />
  </PeopleStack.Navigator>
);

const ProfileStack = createStackNavigator();
const IntroScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name="Intro" component={Intro} />
  </ProfileStack.Navigator>
);

const SettingsStack = createStackNavigator();
const SettingsScreen = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen name="Settings" component={Settings} />
  </SettingsStack.Navigator>
);

const openLink = link => {
  Linking.canOpenURL(link)
    .then(supported => {
      if (supported) {
        Linking.openURL(link);
      } else {
        Alert.alert('Error', 'Sorry, something went wrong.');
      }
    })
    .catch(err => Alert.alert('Error', err.message));
};

const Tab = createBottomTabNavigator();
export default () => {
  useEffect(() => {
    // listen and receive the message from Push Notification server when the app is in the foreground
    const unsubscribe = messaging().onMessage((remoteMessage = {}) => {
      const notification = remoteMessage.notification || {};
      const actions = [];

      if (remoteMessage.data && remoteMessage.data.deeplink) {
        actions.push({
          text: 'Learn More >',
          onPress: () => openLink(remoteMessage.data.deeplink),
        });
      }

      if (notification.title) {
        Alert.alert(notification.title, notification.body, actions);
      }
    });

    return unsubscribe;
  }, []);

  // handle push notifications when the app is in (1) quit state, and (2) background state
  useEffect(() => {
    const onNotificationOpen = (remoteNotification = {}) => {
      if (remoteNotification.data && remoteNotification.data.deeplink) {
        openLink(remoteNotification.data.deeplink);
      }
    };

    // quit state
    messaging().getInitialNotification(onNotificationOpen);

    // background state
    const unsubscribe = messaging().onNotificationOpenedApp(onNotificationOpen);
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer
      linking={{
        prefixes: ['swapidemo://', 'https://reactnativeschool.com'],
        config: {
          screens: {
            PeopleTab: {
              initialRouteName: 'People',
              screens: {
                People: {
                  path: 'people',
                },
                PersonDetails: {
                  path: 'person/:id',
                },
              },
            },
          },
        },
      }}>
      <Tab.Navigator screenOptions={{headerShown: false}}>
        <Tab.Screen
          name="IntroTab"
          component={IntroScreen}
          options={{title: 'Intro'}}
        />
        <Tab.Screen
          name="PeopleTab"
          component={People}
          options={{title: 'People'}}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
