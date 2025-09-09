import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Droplets, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type SensorReading = {
  timestamp: string;
  vibration: number;   // fixed key
  humidity: number;
  strain: number;
};

const Graphs = () => {
  const [data, setData] = useState<SensorReading[]>([]);

  // connect to WebSocket backend
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000"); // change to your backend port

    ws.onmessage = (event) => {
      const reading: SensorReading = JSON.parse(event.data);

      setData((prev) => {
        const updated = [...prev, reading];
        if (updated.length > 20) updated.shift(); // keep last 20 points
        return updated;
      });
    };

    return () => ws.close();
  }, []);

  // format data for charts
  const formatData = (key: keyof SensorReading) =>
    data.map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString(),
      value: d[key],
    }));

  const latest = data[data.length - 1];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-background ">
      {/* Vibration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Vibration Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ChartContainer
              config={{
                vibration: {
                  label: "Vibration (Hz)",
                  color: "hsl(var(--status-critical))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatData("vibration")}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--status-critical))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--status-critical))', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-8 text-center">
            <div className="text-xl font-bold text-status-critical">
              {latest?.vibration?.toFixed(2) || "N/A"} Hz
            </div>
            <p className="text-xs text-muted-foreground">Latest Value</p>
          </div>
        </CardContent>
      </Card>

      {/* Humidity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="h-5 w-5 mr-2 text-blue-500" />
            Humidity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ChartContainer
              config={{
                humidity: {
                  label: "Humidity (%)",
                  color: "hsl(210, 100%, 50%)",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatData("humidity")}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(210, 100%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(210, 100%, 50%)', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-8 text-center">
            <div className="text-xl font-bold text-blue-500">
              {latest?.humidity?.toFixed(2) || "N/A"} %
            </div>
            <p className="text-xs text-muted-foreground">Latest Value</p>
          </div>
        </CardContent>
      </Card>

      {/* Strain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-status-warning" />
            Strain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ChartContainer
              config={{
                strain: {
                  label: "Strain (με)",
                  color: "hsl(var(--status-warning))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatData("strain")}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--status-warning))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--status-warning))', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-8 text-center">
            <div className="text-xl font-bold text-status-warning">
              {latest?.strain?.toFixed(2) || "N/A"} με
            </div>
            <p className="text-xs text-muted-foreground">Latest Value</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Graphs;
