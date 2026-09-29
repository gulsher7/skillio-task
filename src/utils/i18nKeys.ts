import type { Badge, SkillKey } from '@/models/home';

const capitalise = (value: string) => value[0].toUpperCase() + value.slice(1);

export const badgeKeys = (badge: Badge) => {
  const base = `rewards.badge${capitalise(badge.id)}`;
  return { name: base, description: `${base}Desc`, earned: `${base}Earned` };
};

export const skillKeys = (skill: SkillKey) => ({
  label: `skills.${skill}`,
  tip: `skills.${skill}Tip`,
});

export const topicKey = (focusId: string) => `practiceHero.topic${capitalise(focusId)}`;
