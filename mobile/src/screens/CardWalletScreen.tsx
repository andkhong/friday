import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { cardsAPI } from '../api/client';
import { CreditCard } from '../types';

export default function CardWalletScreen() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await cardsAPI.getAll();
      setCards(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load credit cards');
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCards();
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'Visa':
        return '#1A1F71';
      case 'Mastercard':
        return '#EB001B';
      case 'American Express':
        return '#006FCF';
      case 'Discover':
        return '#FF6000';
      default:
        return '#666';
    }
  };

  const renderCard = ({ item }: { item: CreditCard }) => {
    const baseRate = item.rewards_structure.base_rate || 0;
    const categoryRates = item.rewards_structure.categories || {};
    const maxRate = Math.max(
      baseRate,
      ...Object.values(categoryRates)
    );

    return (
      <View style={[styles.card, { borderLeftColor: getNetworkColor(item.network) }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardName}>{item.card_name}</Text>
            <Text style={styles.cardIssuer}>{item.issuer}</Text>
          </View>
          <View style={styles.networkBadge}>
            <Text style={[styles.networkText, { color: getNetworkColor(item.network) }]}>
              {item.network}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.lastFour}>•••• {item.last_four}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, item.is_active ? styles.active : styles.inactive]}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.rewardsSection}>
          <Text style={styles.rewardsTitle}>Rewards</Text>
          <Text style={styles.rewardsRate}>Up to {maxRate}% back</Text>
          {Object.keys(categoryRates).length > 0 && (
            <View style={styles.categoriesList}>
              {Object.entries(categoryRates).slice(0, 3).map(([category, rate]) => (
                <Text key={category} style={styles.categoryText}>
                  {category}: {rate}%
                </Text>
              ))}
            </View>
          )}
        </View>

        {item.annual_fee > 0 && (
          <Text style={styles.annualFee}>Annual Fee: ${item.annual_fee}</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cards</Text>
        <Text style={styles.subtitle}>{cards.length} card{cards.length !== 1 ? 's' : ''}</Text>
      </View>

      {cards.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No credit cards added yet</Text>
          <Text style={styles.emptySubtext}>
            Add your credit cards to get personalized recommendations
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardIssuer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  networkBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastFour: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  active: {
    color: '#4CAF50',
  },
  inactive: {
    color: '#999',
  },
  rewardsSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rewardsRate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  categoriesList: {
    gap: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  annualFee: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
