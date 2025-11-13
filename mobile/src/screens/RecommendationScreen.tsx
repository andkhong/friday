import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { cardsAPI } from '../api/client';
import { CardRecommendation } from '../types';

export default function RecommendationScreen() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<CardRecommendation | null>(null);

  const getRecommendation = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await cardsAPI.getRecommendation(
        parsedAmount,
        merchant || undefined
      );
      setRecommendation(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to get recommendation';
      Alert.alert('Error', errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setRecommendation(null);
    setMerchant('');
    setAmount('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Card Optimizer</Text>
          <Text style={styles.subtitle}>Get the best rewards for your purchase</Text>
        </View>

        {!recommendation ? (
          <View style={styles.form}>
            <Text style={styles.label}>Merchant (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Whole Foods, Starbucks"
              value={merchant}
              onChangeText={setMerchant}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={getRecommendation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Get Recommendation</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.recommendedCard}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RECOMMENDED</Text>
              </View>

              <Text style={styles.cardNameLarge}>{recommendation.recommended_card.name}</Text>
              <Text style={styles.cardNetwork}>
                {recommendation.recommended_card.network} •••• {recommendation.recommended_card.last_four}
              </Text>

              <View style={styles.rewardsDisplay}>
                <Text style={styles.rewardsLabel}>You'll Earn</Text>
                <Text style={styles.rewardsAmount}>${recommendation.expected_rewards.toFixed(2)}</Text>
                <Text style={styles.rewardsRate}>{recommendation.rewards_rate}% back</Text>
              </View>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{recommendation.category}</Text>
              </View>

              {recommendation.savings_vs_default > 0 && (
                <View style={styles.savingsBox}>
                  <Text style={styles.savingsText}>
                    Save ${recommendation.savings_vs_default.toFixed(2)} vs next best card
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.reasoningBox}>
              <Text style={styles.reasoningTitle}>Why this card?</Text>
              <Text style={styles.reasoningText}>{recommendation.reasoning}</Text>
            </View>

            {recommendation.alternatives.length > 0 && (
              <View style={styles.alternativesSection}>
                <Text style={styles.alternativesTitle}>Other Options</Text>
                {recommendation.alternatives.map((alt, index) => (
                  <View key={index} style={styles.alternativeCard}>
                    <Text style={styles.alternativeName}>{alt.name}</Text>
                    <View style={styles.alternativeRewards}>
                      <Text style={styles.alternativeAmount}>
                        ${alt.rewards_amount.toFixed(2)}
                      </Text>
                      <Text style={styles.alternativeRate}>{alt.reward_rate}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>New Recommendation</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
    paddingLeft: 16,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 20,
  },
  recommendedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardNetwork: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  rewardsDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rewardsAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rewardsRate: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  savingsBox: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB300',
  },
  savingsText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '600',
  },
  reasoningBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reasoningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  alternativesSection: {
    marginBottom: 16,
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  alternativeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  alternativeRewards: {
    alignItems: 'flex-end',
  },
  alternativeAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  alternativeRate: {
    fontSize: 14,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  resetButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
