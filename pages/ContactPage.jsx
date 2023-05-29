import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
  Dimensions,
} from "react-native";
import * as Contacts from "expo-contacts";
import { Linking } from "expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth } = Dimensions.get("window");

export default function ContactPage({ navigation }) {
  const handleMainPress = () => {
    navigation.navigate("MainPage");
  };
  const [isModalVisible, setModalVisible] = useState(false);
  // 이름,번호
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactList, setContactList] = useState([]);
  const [phoneNumberError, setPhoneNumberError] = useState("");

  // 연락처 등록 모달 토글
  const handleModalToggle = () => {
    setModalVisible(!isModalVisible);
  };

  // 이름과 전화번호 저장하기
  const saveContactInfo = async (name, phoneNumber) => {
    try {
      await AsyncStorage.setItem("name", name);
      await AsyncStorage.setItem("phoneNumber", phoneNumber);
      console.log("Contact info saved successfully.");
    } catch (error) {
      console.log("Error saving contact info:", error);
    }
  };

  // 저장된 이름과 전화번호 불러오기
  const getContactInfo = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem("contacts");
      if (storedContacts) {
        const parsedContacts = JSON.parse(storedContacts);
        setContactList(parsedContacts);
      }
    } catch (error) {
      console.log("Error retrieving contact info:", error);
    }
  };

  useEffect(() => {
    getContactInfo();
  }, []);
  // 저장된 이름과 전화번호 삭제하기
  const deleteContactInfo = async (index) => {
    try {
      const updatedContactList = [...contactList];
      updatedContactList.splice(index, 1);
      setContactList(updatedContactList);

      await AsyncStorage.setItem(
        "contacts",
        JSON.stringify(updatedContactList)
      );
      console.log("Contact info deleted successfully.");
    } catch (error) {
      console.log("Error deleting contact info:", error);
    }
  };

  // 연락처 등록 처리
  const handleContactRegistration = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneNumberError("연락처를 정확히 입력해주세요.");
      return;
    }

    setPhoneNumberError("");

    try {
      const contactInfo = { name, phoneNumber };
      const storedContacts = await AsyncStorage.getItem("contacts");
      let updatedContacts = [];
      if (storedContacts) {
        const parsedContacts = JSON.parse(storedContacts);
        updatedContacts = [...parsedContacts, contactInfo];
      } else {
        updatedContacts = [contactInfo];
      }
      await AsyncStorage.setItem("contacts", JSON.stringify(updatedContacts));
      console.log("Contact info saved successfully.");
      setContactList(updatedContacts);
    } catch (error) {
      console.log("Error saving contact info:", error);
    }

    setName("");
    setPhoneNumber("");
    setModalVisible(false);
  };

  // 연락처 번호 오류
  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;

    return phoneRegex.test(phoneNumber);
  };

  // 메시지 보내기

  return (
    <View style={styles.contactPage}>
      <View style={styles.herder}>
        <TouchableOpacity onPress={handleMainPress} style={styles.mainLink}>
          <Image source={require("../assets/img/homeBt.png")} />
          <Text style={styles.logoText}>대전 지킴이</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainLink} onPress={handleModalToggle}>
          <Image source={require("../assets/img/plus.png")} />
          <Text style={[styles.logoText, styles.contactPlus]}>연락처 등록</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.ContactInfoBox}>
        {contactList.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <Image
              source={require("../assets/img/user.png")}
              style={styles.ContactImg}
            />
            <View style={styles.contactCardContent}>
              <View style={styles.contentText}>
                <Text style={styles.ContactText}>{contact.name}</Text>
                <Text style={styles.ContactText}>{contact.phoneNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.delete}
                onPress={() => deleteContactInfo(index)}>
                <Text style={styles.deleteText}>연락처삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      {isModalVisible && (
        <Animated.View style={styles.contactForm}>
          <View style={styles.contactInput}>
            <Text style={styles.formText}>성함</Text>
            <TextInput
              placeholder="성함"
              style={[
                styles.Input,
                styles.InputN,
                { backgroundColor: "#F2F8FF" },
              ]}
              value={name}
              onChangeText={(text) => setName(text)}
            />
            <Text style={styles.formText}>전화번호</Text>
            <TextInput
              placeholder="'-'포함해서 입력해주세요."
              style={[
                styles.Input,
                styles.InputP,
                { backgroundColor: "#F2F8FF" },
              ]}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
            />
            <TouchableOpacity
              style={styles.formBtn}
              onPress={handleContactRegistration}>
              <Text style={styles.btnText}>등록하기</Text>
            </TouchableOpacity>
            {phoneNumberError && (
              <Text style={styles.errorText}>{phoneNumberError}</Text>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  contactPage: {},
  herder: {
    backgroundColor: "#579AFF",
    paddingTop: 40,
    paddingBottom: 5,
    paddingHorizontal: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Cafe24Ssurround",
    color: "#fff",
  },
  contactPlus: {
    marginLeft: 4,
  },
  ContactInfoBox: {
    height: "100%",
    backgroundColor: "#eaeaea",
  },
  contactCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },
  contactCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  ContactImg: {
    marginRight: 8,
  },
  ContactText: {
    fontFamily: "Cafe24Ssurround",
    color: "#3a3a3a",
    fontSize: 16,
    marginRight: 16,
  },
  contactForm: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -(screenWidth * 0.35),
    marginTop: -(screenWidth * 0.3),
    width: "70%",
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
  },
  contactInput: {
    width: "100%",
    alignItems: "center",
  },
  formText: {
    width: "100%",
    fontSize: 16,
    fontFamily: "Cafe24Ssurround",
    color: "#3a3a3a",
    marginBottom: 8,
  },
  Input: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  formBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#AACCFF",
    borderRadius: 16,
  },
  btnText: {
    fontFamily: "Cafe24Ssurround",
    color: "#3a3a3a",
  },
  delete: {
    backgroundColor: "#AACCFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  deleteText: {
    fontFamily: "Cafe24Ssurround",
    color: "#fff",
  },
  contentText: {
    flexDirection: "row",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
