import * as React from 'react';
import { Box, Text } from '@anthropic/ink';

export type ClawdPose = 'default';

type Props = {
  pose?: ClawdPose;
  bodyColor?: string;
};

// XCLAW logo - CLAWD ASCII art
const CLAWD_LOGO = [
  '  ██████╗██╗      █████╗ ██╗    ██╗',
  '  ██╔════╝██║     ██╔══██╗██║    ██║',
  '  ██║     ██║     ███████║██║ █╗ ██║',
  '  ██║     ██║     ██╔══██║██║███╗██║',
  '  ╚██████╗███████╗██║  ██║╚███╔███╔╝',
  '   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝',
];

export function Clawd({ pose = 'default', bodyColor }: Props = {}): React.ReactNode {
  const bc = (bodyColor || 'clawd_body') as keyof import('../../utils/theme.js').Theme;

  return (
    <Box flexDirection="column" alignItems="center">
      {CLAWD_LOGO.map((line, i) => (
        <Text key={i} bold color={bc}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
