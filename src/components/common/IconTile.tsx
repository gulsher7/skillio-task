import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ms } from '@/styles/scaling';

import Icon, { type IconName } from './Icon';

type Props = {
  name: IconName;
  color: string;
  background: string;
  size?: number;
  iconSize?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** The tinted rounded square that fronts most rows in the app. */
export default function IconTile({
  name,
  color,
  background,
  size = 44,
  iconSize,
  radius = 14,
  style,
}: Props) {
  const box = ms(size);
  return (
    <View
      style={[
        styles.tile,
        { width: box, height: box, borderRadius: ms(radius), backgroundColor: background },
        style,
      ]}
    >
      <Icon name={name} size={iconSize ?? size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
