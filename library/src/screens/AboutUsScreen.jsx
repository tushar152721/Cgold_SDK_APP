import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import ComtechGoldCopyrightFooter from '../components/ComtechGoldCopyrightFooter';
import AboutUsHero from '../components/about/AboutUsHero';
import AboutMissionVision from '../components/about/AboutMissionVision';
import AboutTeamSection from '../components/about/AboutTeamSection';
import AboutUsFooter from '../components/about/AboutUsFooter';
import { SDK_COLORS } from '../constants';
import { ABOUT_MISSION, ABOUT_VISION } from '../constants/aboutUs';

export default function AboutUsScreen() {
  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact showBack={false} showMenu pageTitle="" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces>
        <AboutUsHero />

        <AboutMissionVision
          image1={ABOUT_MISSION.image1}
          image2={ABOUT_MISSION.image2}
          title1={ABOUT_MISSION.title1}
          title2={ABOUT_MISSION.title2}
          description={ABOUT_MISSION.description}
        />

        <AboutMissionVision
          image1={ABOUT_VISION.image1}
          image2={ABOUT_VISION.image2}
          title1={ABOUT_VISION.title1}
          title2={ABOUT_VISION.title2}
          description={ABOUT_VISION.description}
        />

        <View style={styles.teamSpacer} />
        <AboutTeamSection />
        <AboutUsFooter />

        <View style={styles.footerPad}>
          <ComtechGoldCopyrightFooter variant="cream" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'stretch',
  },
  teamSpacer: {
    height: 24,
  },
  footerPad: {
    paddingHorizontal: 16,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
});
