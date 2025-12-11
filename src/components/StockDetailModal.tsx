import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Brain, BarChart3, Activity } from 'lucide-react';
import type { Prediction } from '@/lib/api';

interface LiveStock {
  symbol: string;
  name?: string;
  prev_close?: number | null;
  latest_price?: number | null;
  change_direction?: 'UP' | 'DOWN' | 'FLAT' | null;
  change_abs?: number | null;
  change_pct?: number | null;
  high?: number | null;
  low?: number | null;
  avg_price?: number | null;
  volume?: number | null;
  trade_time?: string | null;
  prediction?: {
    predicted_close: number;
    confidence: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
  };
}

interface StockDetailModalProps {
  stock: LiveStock | null;
  fullPrediction?: Prediction | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatNumber = (value: number | null | undefined, decimals = 2) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    });
  }
  return '--';
};

const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  fullPrediction,
  isOpen,
  onClose,
}) => {
  if (!stock) return null;

  const changeIcon = stock.change_direction === 'UP' ? (
    <TrendingUp className="w-5 h-5 text-success" />
  ) : stock.change_direction === 'DOWN' ? (
    <TrendingDown className="w-5 h-5 text-destructive" />
  ) : (
    <Minus className="w-5 h-5 text-muted-foreground" />
  );

  const changeColor =
    stock.change_direction === 'UP'
      ? 'text-success'
      : stock.change_direction === 'DOWN'
      ? 'text-destructive'
      : 'text-muted-foreground';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {stock.symbol}
            <span className="text-base font-normal text-muted-foreground">{stock.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Price Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Current Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Latest Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(stock.latest_price)} KES
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Change</p>
                  <div className={`text-xl font-semibold flex items-center gap-1 ${changeColor}`}>
                    {changeIcon}
                    {formatNumber(stock.change_abs)} ({formatNumber(stock.change_pct)}%)
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Day's Range</p>
                  <p className="text-lg font-medium text-foreground">
                    {formatNumber(stock.low)} - {formatNumber(stock.high)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="text-lg font-medium text-foreground">
                    {formatNumber(stock.volume, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ML Predictions Section */}
          {fullPrediction && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  ML Predictions - End of Day Close
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ensemble Prediction */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ensemble Prediction</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatNumber(fullPrediction.predicted_close)} KES
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stock.latest_price &&
                          `${
                            fullPrediction.predicted_close > stock.latest_price
                              ? '+'
                              : ''
                          }${formatNumber(
                            ((fullPrediction.predicted_close - stock.latest_price) /
                              stock.latest_price) *
                              100
                          )}% from current`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-lg px-4 py-2 ${
                          fullPrediction.signal === 'BUY'
                            ? 'border-success text-success bg-success/10'
                            : fullPrediction.signal === 'SELL'
                            ? 'border-destructive text-destructive bg-destructive/10'
                            : 'border-muted text-muted-foreground bg-muted/10'
                        }`}
                      >
                        {fullPrediction.signal}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Confidence: {(fullPrediction.ensemble_confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Model Predictions */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Individual Model Predictions
                  </h4>
                  <div className="space-y-3">
                    {/* LSTM */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium text-foreground">LSTM</p>
                          <p className="text-xs text-muted-foreground">
                            Long Short-Term Memory Network
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {formatNumber(fullPrediction.lstm_pred)} KES
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(fullPrediction.lstm_confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>

                    {/* Ensemble */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <div>
                          <p className="font-medium text-foreground">Ensemble</p>
                          <p className="text-xs text-muted-foreground">
                            Weighted LSTM + Prophet Average
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {formatNumber(fullPrediction.ensemble_pred)} KES
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(fullPrediction.ensemble_confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>

                    {/* Prophet */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium text-foreground">Prophet</p>
                          <p className="text-xs text-muted-foreground">
                            Time Series Forecasting
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {formatNumber(fullPrediction.prophet_pred)} KES
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(fullPrediction.prophet_confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prediction Info */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Note:</span> Ensemble prediction is a
                    confidence-weighted average of LSTM and Prophet models. Predictions are for
                    educational purposes only and should not be considered financial advice.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated:{' '}
                    {new Date(fullPrediction.prediction_time).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Predictions Available */}
          {!fullPrediction && (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No ML predictions available for this stock yet.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Predictions are generated for stocks with sufficient historical data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailModal;
