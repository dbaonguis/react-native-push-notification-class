/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, Switch, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const DEFAULT_PREFERENCES = [
  {
    title: 'General Announcements',
    topicId: 'general-announcements',
    subscribed: false,
  },
  {
    title: 'Character Details',
    topicId: 'character-details',
    subscribed: false,
  },
];

export const Settings = () => {
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('DEMO_APP::PUSH_TOPICS').then(results => {
      if (results) {
        setPreferences(JSON.parse(results));
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    });
  }, []);

  useEffect(() => {
    // Subscribe/Unsubscribe to a topic
    preferences.forEach((preference) => {
      if (preference.subscribed) {
        messaging().subscribeToTopic(preference.topicId);
      } else {
        messaging().unsubscribeFromTopic(preference.topicId);
      }
    });

    AsyncStorage.setItem('DEMO_APP::PUSH_TOPICS', JSON.stringify(preferences));
  }, [preferences]);

  const onPrefChange = topicId => value => {
    setPreferences(prevVal => {
      const newPrefs = prevVal.map(preference => {
        if (preference.topicId === topicId) {
          return {
            ...preference,
            subscribed: value,
          };
        }
        return preference;
      });
      return newPrefs;
    });
  };

  return (
    <ScrollView style={styles.container}>
      {preferences.length > 0 &&
        preferences.map(preference => {
          return (
            <View key={preference.topicId} style={styles.preference}>
              <Text>{preference.title}</Text>
              <Switch
                trackColor={{
                  true: 'lightgreen',
                  false: 'gray',
                }}
                thumbColor={{
                  true: 'green',
                  false: 'gray',
                }}
                value={preference.subscribed}
                onValueChange={onPrefChange(preference.topicId)}
              />
            </View>
          );
        })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'white',
  },
  preference: {
    // backgroundColor: 'yellow',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
});
