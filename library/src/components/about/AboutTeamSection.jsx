import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SDK_COLORS } from '../../constants';
import { GOLD_TEAM_DATA } from '../../constants/aboutUs';
import { ABOUT_ASSETS } from '../../constants/aboutAssets';

function TeamMemberCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const body = expanded && item.readMoreText ? item.readMoreText : item.description;

  return (
    <View style={styles.memberRow}>
      <Image source={item.image} style={styles.memberPhoto} />
      <View style={styles.memberCard}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Image source={ABOUT_ASSETS.linkedInIcon} style={styles.linkedIn} />
        </View>
        <Text style={styles.memberPost}>{item.post}</Text>
        <Image source={ABOUT_ASSETS.dividerLine} style={styles.divider} resizeMode="contain" />
        <Text style={styles.memberBio}>{body}</Text>
        <TouchableOpacity
          style={styles.readMoreBtn}
          onPress={() => setExpanded(prev => !prev)}
          activeOpacity={0.8}>
          <Text style={styles.readMoreText}>
            {expanded ? 'Read Less' : 'Read More'}
          </Text>
          <Image
            source={ABOUT_ASSETS.readMoreArrow}
            style={[styles.readMoreArrow, expanded ? styles.readMoreArrowUp : null]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AboutTeamSection() {
  return (
    <View style={styles.outer}>
      <View style={styles.header}>
        <Image
          source={ABOUT_ASSETS.meetTeamLightIcon}
          style={styles.teamWatermark}
          resizeMode="contain"
        />
        <View style={styles.headerTitles}>
          <Text style={styles.heading}>Meet our dedicated team</Text>
          <Text style={styles.heading}>
            powering <Text style={styles.headingGold}>ComTech</Text> Gold
          </Text>
        </View>
      </View>

      {GOLD_TEAM_DATA.map(item => (
        <TeamMemberCard key={String(item.id)} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '90%',
    alignSelf: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F9D58C',
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  teamWatermark: {
    alignSelf: 'center',
    maxWidth: '100%',
  },
  headerTitles: {
    width: '100%',
    marginTop: -18,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
    lineHeight: 30,
  },
  headingGold: {
    color: SDK_COLORS.primary,
  },
  memberRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  memberPhoto: {
    maxWidth: '45%',
    flexShrink: 0,
  },
  memberCard: {
    width: '50%',
    backgroundColor: '#F5E4BC',
    borderRadius: 12,
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginRight: 6,
  },
  linkedIn: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  memberPost: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '300',
    color: SDK_COLORS.textDark,
    lineHeight: 16,
  },
  divider: {
    width: '100%',
    height: 8,
    marginVertical: 12,
  },
  memberBio: {
    fontSize: 10,
    lineHeight: 15,
    color: SDK_COLORS.textDark,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
    marginRight: 2,
  },
  readMoreArrow: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  readMoreArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
});
