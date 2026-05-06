import * as React from 'react';
import { type ReactNode, useEffect } from 'react';
import { useMainLoopModel } from '../../hooks/useMainLoopModel.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { Box, Text, stringWidth } from '@anthropic/ink';
import { useAppState } from '../../state/AppState.js';
import { getEffortSuffix } from '../../utils/effort.js';
import { truncate } from '../../utils/format.js';
import { isFullscreenEnvEnabled } from '../../utils/fullscreen.js';
import { formatModelAndBilling, getLogoDisplayData, truncatePath } from '../../utils/logoV2Utils.js';
import { renderModelSetting } from '../../utils/model/model.js';
import { OffscreenFreeze } from '../OffscreenFreeze.js';
import { AnimatedClawd } from './AnimatedClawd.js';
import { Clawd } from './Clawd.js';
import { XCLAW_LOGO, XCLAW_NAME, XCLAW_TAGLINE } from '../../constants/xclaw.js';
import { useCurrentMode } from '../../modes/store.js';
import type { Theme } from '../../utils/theme.js';
import { GuestPassesUpsell, incrementGuestPassesSeenCount, useShowGuestPassesUpsell } from './GuestPassesUpsell.js';
import {
  incrementOverageCreditUpsellSeenCount,
  OverageCreditUpsell,
  useShowOverageCreditUpsell,
} from './OverageCreditUpsell.js';

export function CondensedLogo(): ReactNode {
  const { columns } = useTerminalSize();
  const agent = useAppState(s => s.agent);
  const effortValue = useAppState(s => s.effortValue);
  const xclawMode = useCurrentMode();
  const model = useMainLoopModel();
  const modelDisplayName = renderModelSetting(model);
  const { version, cwd, billingType, agentName: agentNameFromSettings } = getLogoDisplayData();

  // Prefer AppState.agent (set from --agent CLI flag) over settings
  const agentName = agent ?? agentNameFromSettings;
  const showGuestPassesUpsell = useShowGuestPassesUpsell();
  const showOverageCreditUpsell = useShowOverageCreditUpsell();

  useEffect(() => {
    if (showGuestPassesUpsell) {
      incrementGuestPassesSeenCount();
    }
  }, [showGuestPassesUpsell]);

  useEffect(() => {
    if (showOverageCreditUpsell && !showGuestPassesUpsell) {
      incrementOverageCreditUpsellSeenCount();
    }
  }, [showOverageCreditUpsell, showGuestPassesUpsell]);

  // Show ASCII art logo when terminal is wide enough (logo is ~46 chars wide)
  const showAsciiLogo = columns >= 60;
  // Calculate available width for text content
  // Account for: logo/clawd width + gap (2) + padding (2)
  const logoWidth = showAsciiLogo ? 48 : 15;
  const textWidth = Math.max(columns - logoWidth, 20);

  // Truncate version to fit within available width, accounting for "xclaw v" prefix
  const versionPrefix = 'xclaw v';
  const truncatedVersion = truncate(version, Math.max(textWidth - versionPrefix.length, 6));

  const effortSuffix = getEffortSuffix(model, effortValue);
  const { shouldSplit, truncatedModel, truncatedBilling } = formatModelAndBilling(
    modelDisplayName + effortSuffix,
    billingType,
    textWidth,
  );

  // Truncate path, accounting for agent name if present
  const separator = ' · ';
  const atPrefix = '@';
  const cwdAvailableWidth = agentName
    ? textWidth - atPrefix.length - stringWidth(agentName) - separator.length
    : textWidth;
  const truncatedCwd = truncatePath(cwd, Math.max(cwdAvailableWidth, 10));

  // OffscreenFreeze: the logo sits at the top of the message list and is the
  // first thing to enter scrollback. useMainLoopModel() subscribes to model
  // changes and getLogoDisplayData() reads getCwd()/subscription state — any
  // of which changing while in scrollback would force a full terminal reset.
  return (
    <OffscreenFreeze>
      <Box flexDirection="row" gap={2} alignItems="center">
        {showAsciiLogo ? (
          <Box flexDirection="column" alignItems="center">
            <Text color={(xclawMode.ui.accentColor || 'claude') as keyof Theme}>{XCLAW_LOGO}</Text>
            <Text dimColor>{XCLAW_TAGLINE}</Text>
          </Box>
        ) : isFullscreenEnvEnabled() ? (
          <AnimatedClawd />
        ) : (
          <Clawd />
        )}

        {/* Info */}
        <Box flexDirection="column">
          <Text>
            <Text bold>{XCLAW_NAME}</Text> <Text dimColor>v{truncatedVersion}</Text>
          </Text>
          <Text italic dimColor>
            {XCLAW_TAGLINE}
          </Text>
          {shouldSplit ? (
            <>
              <Text dimColor>{truncatedModel}</Text>
              <Text dimColor>{truncatedBilling}</Text>
            </>
          ) : (
            <Text dimColor>
              {truncatedModel} · {truncatedBilling}
            </Text>
          )}
          <Text dimColor>{agentName ? `@${agentName} · ${truncatedCwd}` : truncatedCwd}</Text>
          {showGuestPassesUpsell && <GuestPassesUpsell />}
          {!showGuestPassesUpsell && showOverageCreditUpsell && <OverageCreditUpsell maxWidth={textWidth} twoLine />}
        </Box>
      </Box>
    </OffscreenFreeze>
  );
}
