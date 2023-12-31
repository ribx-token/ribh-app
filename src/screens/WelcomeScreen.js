import React, {useEffect, useState} from 'react';
// import Button from 'react-native-button';
import {ActivityIndicator, Text, View, StyleSheet, Alert, Button} from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {login} from '../reducers';
import {AppStyles} from '../AppStyles';

function WelcomeScreen({navigation}) {
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    tryToLoginFirst();
  }, []);

  async function tryToLoginFirst() {
    const email = await AsyncStorage.getItem('@loggedInUserID:key');
    const password = await AsyncStorage.getItem('@loggedInUserID:password');
    const id = await AsyncStorage.getItem('@loggedInUserID:id');
    if (
      id != null &&
      id.length > 0 &&
      password != null &&
      password.length > 0
    ) {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          firestore().collection('users').doc(id).get()
            .then(function (doc) {
              var userDict = {
                id: id,
                email: email,
                profileURL: doc.photoURL,
                fullname: doc.data().fullname,
              };
              if (doc.exists) {
                dispatch(login(userDict));
                navigation.navigate('DrawerStack');
              } else {
                setIsLoading(false);
              }
            })
            .catch(function (error) {
              setIsLoading(false);
              const {code, message} = error;
              Alert.alert(message);
            });
        })
        .catch((error) => {
          const {code, message} = error;
          setIsLoading(false);
          Alert.alert(message);
          // For details of error codes, see the docs
          // The message contains the default Firebase string
          // representation of the error
        });
      return;
    } else if(id && id.length) {
       user = await firestore().collection('users').doc(id).get()
        if (user) {
          const userDict = {
                  id: user.data().id,
                  fullname: user._data.fullname,
                  email: user.data().email,
                  photoURL: user._data.photoURL,
                };
          dispatch(login(userDict));
          navigation.navigate('DrawerStack');
          setIsLoading(false);
        }
    }
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <ActivityIndicator
        style={styles.spinner}
        size="large"
        color={AppStyles.color.tint}
      />
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All things token</Text>
      <Button
        containerStyle={styles.loginContainer}
        style={styles.loginText}
        title="Log In"
        onPress={() => navigation.navigate('Login')}>
      </Button>
      <Button
        containerStyle={styles.signupContainer}
        style={styles.signupText}
        title="Sign up"
        onPress={() => navigation.navigate('Signup')}>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 150,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: AppStyles.fontSize.title,
    fontWeight: 'bold',
    color: AppStyles.color.tint,
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  loginContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.tint,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30,
  },
  loginText: {
    color: AppStyles.color.white,
  },
  signupContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.white,
    borderRadius: AppStyles.borderRadius.main,
    padding: 8,
    borderWidth: 1,
    borderColor: AppStyles.color.tint,
    marginTop: 15,
  },
  signupText: {
    color: AppStyles.color.tint,
  },
  spinner: {
    marginTop: 200,
  },
});

export default WelcomeScreen;
