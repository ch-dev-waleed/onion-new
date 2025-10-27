// import { ChartPath, ChartPathProvider } from "@rainbow-me/animated-charts";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-wagmi-charts";
const TopCoin = ({ item }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartError, setChartError] = useState(false);

  const fullName = item.CoinInfo.FullName ?? "Unknown Coin";
  const internal = item.CoinInfo.Internal ?? null;
  const imageUrl = item.CoinInfo.ImageUrl ?? "";
  const price = item.RAW.USD.PRICE?.toFixed?.(2) ?? "0.00";
  const priceChange = item.RAW.USD.CHANGEPCT24HOUR ?? 0;
  const priceChangeColor = priceChange > 0 ? "#43DE6E" : "#FF4D4D";

  useEffect(() => {
    const fetchChartData = async () => {
      if (!internal) return;
      setLoading(true);
      setChartError(false);
      try {
        const response = await axios.get(
          `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${internal}&tsym=USD&limit=24`
        );
        const data = response.data.Data.Data;
        if (!data || data.length === 0) {
          setChartError(true);
          return;
        }
        const formattedData = data.map((point) => ({
          timestamp: point.time , // convert seconds to milliseconds
          value: Number(point.close) || 0,
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [internal]);
  return (
    <LinearGradient
      colors={
        priceChange > 0
          ? ["#242424FF", "#00FF4860"]
          : ["#242424FF", "#FF4D4D34"]
      }
      style={styles.container}
    >
      {/* <View style={styles.chartContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#999" />
        ) : chartError || chartData.length === 0 ? (
          <Text style={{ color: "#aaa", fontSize: 10 }}>No Data</Text>
        ) : (
          <ChartPathProvider data={{ points: chartData, smoothingStrategy: "bezier" }}>
            <ChartPath
              height={40}
              width={80}
              stroke={priceChange > 0 ? "#43DE6E" : "#FF4D4D"}
              strokeWidth={2}
            />
          </ChartPathProvider>
        )}
      </View> */}
      <View style={styles.chartContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#999" />
        ) : chartError || chartData.length === 0 ? (
          <Text style={{ color: "#aaa", fontSize: 10 }}>No Data</Text>
        ) : (
          <LineChart.Provider data={chartData}>
            <LineChart height={90} width={70}>
              <LineChart.Path
                width={1}
                color={priceChange > 0 ? "#43DE6E" : "#FF4D4D"}
              />
            </LineChart>
          </LineChart.Provider>
        )}
      </View>
      <View style={styles.cardHeadContainer}>
        <View style={styles.headContentTop}>
          <Image
            style={styles.contentImage}
            source={{
              uri: "https://www.cryptocompare.com" + imageUrl,
            }}
          />
          <View style={styles.contentInfo}>
            <Text style={styles.coinTitle}>{fullName}</Text>
            <Text style={styles.coinSubtitle}>{internal}</Text>
          </View>
        </View>

        <View style={styles.headContentBottom}>
          <View style={styles.priceChangeContainer}>
            <Image
              style={styles.indicateIcon}
              source={
                priceChange > 0
                  ? require("../../assets/images/iconsapp/up.png")
                  : require("../../assets/images/iconsapp/down.png")
              }
            />
            <Text style={[styles.priceChange, { color: priceChangeColor }]}>
              {priceChange.toFixed(2)}%
            </Text>
          </View>
          <Text style={styles.coinPrice}>$ {price}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#242424",
    width: "162",
    // paddingHorizontal: 2,
    borderRadius: 15,
    overflow: "hidden",
    height: 92,
    flexShrink: 1, // ✅ Allow shrinking within row
    maxWidth: 162, // ✅ Prevent text from overflowing beyond container
  },
  cardHeadContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    display: "flex",
    flexDirection: "column",
  },
  headContentTop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headContentBottom: {
    marginTop: 10,
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  contentImage: {
    width: 25,
    height: 25,
  },
  contentInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  coinTitle: {
    fontSize: 12,
    color: "#ffffff",
    flexWrap: "wrap",
    flexShrink: 1,
    // width: 100,
  },
  coinSubtitle: {
    fontSize: 11,
    color: "#ffffff",
    marginTop: 2,
  },
  coinPrice: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
    marginTop: 2,
  },
  priceChangeContainer: {
    marginTop: 2,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  indicateIcon: {
    width: 7,
    height: 6,
  },
  priceChange: {
    fontSize: 11,
  },
  chartContainer: {
    position: "absolute",
    top: 28,
    right: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(TopCoin);
