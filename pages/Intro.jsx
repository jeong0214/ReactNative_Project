import { View, ImageBackground, StyleSheet, Text, Image } from "react-native";

export default function Intro() {
  return (
    <View style={styles.intro}>
      <ImageBackground
        source={require("../assets/img/bg.png")}
        style={styles.bg}
      >
        <View style={styles.logo}>
          <Image source={require("../assets/img/introLogo.png")} />
          <Text style={styles.logoText}>대전 지키미</Text>
        </View>
        <View style={styles.logoMainText}>
          <View style={styles.logoWrap}>
            <Text style={styles.text}>당신의 귀갓길을</Text>
            <Image
              style={styles.textImg}
              source={require("../assets/img/introImg.png")}
            />
          </View>
          <Text style={styles.text}>안전하게 안내해드리겠습니다.</Text>
        </View>
      </ImageBackground>
    </View>
  );
}
const styles = StyleSheet.create({
  intro: {
    flex: 1,
  },
  bg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "35%",
  },
  logo: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    paddingBottom: 16,
    width: "67%",
    borderColor: "#3a3a3a",
  },
  logoText: {
    fontSize: 24,
    fontFamily: "Cafe24Ssurround",
    marginTop: 8,
    color: "#3a3a3a",
  },
  logoMainText: {
    paddingTop: 16,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  text: {
    fontFamily: "Cafe24Ssurround",
    fontSize: 20,
    color: "#3a3a3a",
  },
  textImg: {
    marginLeft: 8,
  },
});
