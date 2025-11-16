import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Thermometer, Droplets, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DataPoint {
  time: number;
  temperature: number;
  humidity: number;
}

export function LogSession() {
  const [duration, setDuration] = useState('30');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { time: 0, temperature: 70, humidity: 20 }
  ]);
  const [notes, setNotes] = useState('');

  const addDataPoint = () => {
    const lastPoint = dataPoints[dataPoints.length - 1];
    const newTime = lastPoint.time + 5;
    
    if (newTime <= parseInt(duration)) {
      setDataPoints([...dataPoints, {
        time: newTime,
        temperature: 80,
        humidity: 30
      }]);
    } else {
      toast.error('Cannot add more data points beyond session duration');
    }
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 1) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index: number, field: 'temperature' | 'humidity', value: string) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index][field] = parseInt(value) || 0;
    setDataPoints(newDataPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Session logged! 🔥');
    
    // Reset form
    setDuration('30');
    setDataPoints([{ time: 0, temperature: 70, humidity: 20 }]);
    setNotes('');
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold text-white">Log Sauna Session</h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Card className="p-5 bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl">
          <Label htmlFor="duration" className="text-sm font-bold text-white">Session Duration</Label>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="120"
              required
              placeholder="Minutes"
              className="bg-[#0a0a0a] border-[#2a2a2a] text-white font-normal"
            />
          </div>
        </Card>

        <Card className="p-5 bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-bold text-white">Temperature & Humidity Data</Label>
            <Button 
              type="button"
              size="sm"
              variant="outline"
              onClick={addDataPoint}
              className="border-[#D40000] text-[#D40000] hover:bg-[#D40000] hover:text-white font-bold text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="space-y-3">
            {dataPoints.map((point, index) => (
              <div key={index} className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-300 font-bold">At {point.time} minutes</p>
                  {dataPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDataPoint(index)}
                      className="text-gray-500 hover:text-[#D40000] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-300 font-normal">Temperature (°C)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Thermometer className="w-4 h-4 text-[#D40000]" />
                      <Input
                        type="number"
                        value={point.temperature}
                        onChange={(e) => updateDataPoint(index, 'temperature', e.target.value)}
                        min="0"
                        max="120"
                        required
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-300 font-normal">Humidity (%)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <Input
                        type="number"
                        value={point.humidity}
                        onChange={(e) => updateDataPoint(index, 'humidity', e.target.value)}
                        min="0"
                        max="100"
                        required
                        className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl">
          <Label htmlFor="notes" className="text-sm font-bold text-white">Session Notes</Label>
          <Textarea
            id="notes"
            placeholder="How was your session? Any observations?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 min-h-[100px] bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500 font-normal"
          />
        </Card>

        <Button type="submit" className="w-full bg-[#D40000] hover:bg-[#b00000] text-white font-bold py-6 rounded-xl">
          Log Session 🔥
        </Button>
      </form>
    </div>
  );
}