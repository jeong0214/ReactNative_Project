import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";

export default function MainPage({ navigation }) {
  const [departure, setDeparture] = useState("");
  const [MDestination, setMDestination] = useState("");

  const handleSearchPress = () => {
    navigation.navigate("MapPage", {
      departure: departure,
      MDestination: MDestination,
    });
  };
  const handleMapPress = () => {
    navigation.navigate("MapPage", {
      departure: null,
      MDestination: null,
    });
  };
  const handleContactPress = () => {
    navigation.navigate("ContactPage");
  };
  const handleSwapValues = () => {
    setDeparture(MDestination);
    setMDestination(departure);
  };
  return (
    <View style={styles.MainPage}>
      <View style={styles.MainTop}>
        <ImageBackground
          source={require("../assets/img/mainBg.png")}
          style={styles.MainTopDT}>
          <Image source={require("../assets/img/mainicon.png")} />
          <Text style={styles.title}>대전 지키미</Text>
        </ImageBackground>
      </View>
      <View style={styles.Search}>
        <ImageBackground
          source={require("../assets/img/searchBg.png")}
          style={styles.SearchBg}>
          <Text style={styles.SearchTitle}>위치검색</Text>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="출발지"
              placeholderTextColor="#fff"
              value={departure}
              onChangeText={(text) => setDeparture(text)}
            />
            <TouchableOpacity onPress={handleSwapValues}>
              <Image source={require("../assets/img/substitute.png")} />
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="목적지"
              placeholderTextColor="#fff"
              value={MDestination}
              onChangeText={(text) => setMDestination(text)}
            />
            <TouchableOpacity onPress={handleSearchPress}>
              <Image source={require("../assets/img/search.png")} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.mainBottom}>
        <View style={styles.mainMap}>
          <TouchableOpacity onPress={handleMapPress} style={styles.mapLink}>
            <ImageBackground
              style={styles.Link}
              source={require("../assets/img/searchBg.png")}>
              <Text style={styles.LinkText}>지도 검색</Text>
              <Image source={require("../assets/img/mapPH.png")} />
            </ImageBackground>
          </TouchableOpacity>
          <Text style={styles.LinkDetail}>
            안내한 경로 상에 CCTV위치를 참고해 안전한 길로 가세요.
          </Text>
        </View>
        <View style={styles.mainContact}>
          <Text style={styles.LinkDetail}>
            위급 상황 시 바로 연락을 보낼 연락처를 등록해보세요.
          </Text>
          <TouchableOpacity
            onPress={handleContactPress}
            style={styles.contactLink}>
            <ImageBackground
              style={styles.Link}
              source={require("../assets/img/searchBg.png")}>
              <Text style={styles.LinkText}>긴급 연락망</Text>
              <Image source={require("../assets/img/numberPH.png")} />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  MainPage: {
    flex: 1,
  },
  MainTop: {},
  MainTopDT: {
    alignItems: "center",
    justifyContent: "center",
    height: 270,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    fontFamily: "Cafe24Ssurround",
  },
  Search: {
    width: "100%",
  },
  SearchBg: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
  },
  SearchTitle: {
    fontFamily: "Cafe24Ssurround",
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  form: {
    width: "75%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    width: "85%",
    marginBottom: 10,
    fontFamily: "Cafe24SsurroundAir",
  },
  mainBottom: {
    marginVertical: 40,
  },
  mainMap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapLink: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  Link: {
    alignItems: "center",
    paddingHorizontal: 35,
    paddingVertical: 10,
  },
  LinkText: {
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontFamily: "Cafe24Ssurround",
    marginBottom: 10,
  },
  LinkDetail: {
    width: "58%",
    textAlign: "center",
    flexWrap: "wrap",
    fontFamily: "Cafe24SsurroundAir",
    paddingHorizontal: 20,
  },
  mainContact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactLink: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: "hidden",
  },
});
