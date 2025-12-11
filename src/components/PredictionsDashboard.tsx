import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { getPredictions, type Prediction } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortField = 'symbol' | 'confidence' | 'expected_gain' | 'signal';
type SortOrder = 'asc' | 'desc';

const PredictionsDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortField, setSortField] = useState<SortField>('expected_gain');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterSignal, setFilterSignal] = useState<'ALL' | 'BUY' | 'SELL' | 'HOLD'>('ALL');

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await getPredictions();
      if (response && response.predictions) {
        setPredictions(response.predictions);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const calculateExpectedGain = (prediction: Prediction): number => {
    if (!prediction.current_price || prediction.current_price === 0) return 0;
    return ((prediction.predicted_close - prediction.current_price) / prediction.current_price) * 100;
  };

  const sortedAndFilteredPredictions = useMemo(() => {
    let filtered = [...predictions];

    // Apply signal filter
    if (filterSignal !== 'ALL') {
      filtered = filtered.filter((p) => p.signal === filterSignal);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'confidence':
          comparison = a.ensemble_confidence - b.ensemble_confidence;
          break;
        case 'expected_gain':
          comparison = calculateExpectedGain(a) - calculateExpectedGain(b);
          break;
        case 'signal':
          const signalOrder = { BUY: 0, HOLD: 1, SELL: 2 };
          comparison = signalOrder[a.signal] - signalOrder[b.signal];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [predictions, sortField, sortOrder, filterSignal]);

  const stats = useMemo(() => {
    const buySignals = predictions.filter((p) => p.signal === 'BUY');
    const sellSignals = predictions.filter((p) => p.signal === 'SELL');
    const holdSignals = predictions.filter((p) => p.signal === 'HOLD');
    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.ensemble_confidence, 0) / predictions.length
        : 0;

    return {
      total: predictions.length,
      buy: buySignals.length,
      sell: sellSignals.length,
      hold: holdSignals.length,
      avgConfidence,
    };
  }, [predictions]);

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'expected_gain' || field === 'confidence' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            onClick={fetchPredictions}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Predictions</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">BUY Signals</p>
                <p className="text-2xl font-bold text-success">{stats.buy}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">SELL Signals</p>
            <p className="text-2xl font-bold text-destructive">{stats.sell}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">HOLD Signals</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.hold}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
            <p className="text-2xl font-bold text-primary">
              {formatNumber(stats.avgConfidence * 100, 0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by Signal:</span>
              <Select
                value={filterSignal}
                onValueChange={(value: 'ALL' | 'BUY' | 'SELL' | 'HOLD') =>
                  setFilterSignal(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Signals</SelectItem>
                  <SelectItem value="BUY">BUY Only</SelectItem>
                  <SelectItem value="SELL">SELL Only</SelectItem>
                  <SelectItem value="HOLD">HOLD Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Table */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">
          Loading predictions...
        </div>
      ) : sortedAndFilteredPredictions.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-20 text-center">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No predictions available</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('symbol')}
                  >
                    <div className="flex items-center gap-2">
                      Symbol
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Predicted Close
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('expected_gain')}
                  >
                    <div className="flex items-center gap-2">
                      Expected Gain
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('signal')}
                  >
                    <div className="flex items-center gap-2">
                      Signal
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('confidence')}
                  >
                    <div className="flex items-center gap-2">
                      Confidence
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    LSTM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prophet
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredPredictions.map((pred, index) => {
                  const expectedGain = calculateExpectedGain(pred);
                  const isEven = index % 2 === 0;

                  return (
                    <tr
                      key={pred.symbol}
                      className={`${
                        isEven ? 'bg-muted/20' : 'bg-background'
                      } hover:bg-muted/50 border-b border-border transition-colors`}
                    >
                      <td className="px-4 py-3 font-bold text-foreground">{pred.symbol}</td>
                      <td className="px-4 py-3 text-foreground">
                        {formatNumber(pred.current_price)} KES
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatNumber(pred.predicted_close)} KES
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          expectedGain > 1
                            ? 'text-success'
                            : expectedGain < -1
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {expectedGain > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : expectedGain < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : null}
                          {expectedGain > 0 ? '+' : ''}
                          {formatNumber(expectedGain)}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`${
                            pred.signal === 'BUY'
                              ? 'border-success text-success bg-success/10'
                              : pred.signal === 'SELL'
                              ? 'border-destructive text-destructive bg-destructive/10'
                              : 'border-muted text-muted-foreground bg-muted/10'
                          }`}
                        >
                          {pred.signal}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatNumber(pred.ensemble_confidence * 100, 0)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div>
                          <div className="font-medium text-foreground">
                            {formatNumber(pred.lstm_pred)}
                          </div>
                          <div className="text-xs">
                            {formatNumber(pred.lstm_confidence * 100, 0)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div>
                          <div className="font-medium text-foreground">
                            {formatNumber(pred.prophet_pred)}
                          </div>
                          <div className="text-xs">
                            {formatNumber(pred.prophet_confidence * 100, 0)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Model Performance Comparison */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Model Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LSTM */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-semibold text-foreground">LSTM</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Long Short-Term Memory Network
              </p>
              <p className="text-xs text-muted-foreground">
                Avg Confidence:{' '}
                <span className="font-semibold text-foreground">
                  {predictions.length > 0
                    ? formatNumber(
                        (predictions.reduce((sum, p) => sum + p.lstm_confidence, 0) /
                          predictions.length) *
                          100,
                        0
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>

            {/* Prophet */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="font-semibold text-foreground">Prophet</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Time Series Forecasting</p>
              <p className="text-xs text-muted-foreground">
                Avg Confidence:{' '}
                <span className="font-semibold text-foreground">
                  {predictions.length > 0
                    ? formatNumber(
                        (predictions.reduce((sum, p) => sum + p.prophet_confidence, 0) /
                          predictions.length) *
                          100,
                        0
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-card border-border mt-6">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Disclaimer:</span> These predictions are generated
            by machine learning models for educational and informational purposes only. They
            should not be considered as financial advice. Always conduct your own research and
            consult with a qualified financial advisor before making investment decisions. Past
            performance and predictions do not guarantee future results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsDashboard;
