import React from 'react';
import { RefreshControl } from 'react-native';
import { COLORS } from '../../styles/colors';

const PullToRefresh = ({ refreshing, onRefresh, children, ...props }) => {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[COLORS.primary]}
      tintColor={COLORS.primary}
      {...props}
    >
      {children}
    </RefreshControl>
  );
};

export default PullToRefresh;
