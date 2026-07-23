import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, HardDrive, Layers } from 'lucide-react';

export default function HighPerformanceDashboard() {
  const [metrics, setMetrics] = useState({
    concurrentUsers: 104820,
    redisHitRate: 98.4,
    queueThroughput: 12450,
    activePool: 4820,
    searchLatency: 1.2,
    rateLimitingStatus: 'Optimal'
  });

  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);

  // Real-time fluctuating metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        concurrentUsers: Math.floor(102000 + Math.random() * 5000),
        queueThroughput: Math.floor(12000 + Math.random() * 800),
        activePool: Math.floor(4700 + Math.random() * 200),
        searchLatency: parseFloat((1.1 + Math.random() * 0.3).toFixed(2))
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const triggerTatkalSpike = () => {
    setIsSimulatingSpike(true);
    setMetrics(prev => ({
      ...prev,
      concurrentUsers: 245000,
      queueThroughput: 28900,
      activePool: 4980,
      searchLatency: 2.1
    }));

    setTimeout(() => {
      setIsSimulatingSpike(false);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-950 text-xs font-bold mb-3">
          <Cpu className="w-4 h-4 text-blue-900" />
          <span>High-Scale Performance & Infrastructure Telemetry</span>
        </div>
        <h2 className="text-3xl font-black text-blue-950">
          Handling 100,000+ Concurrent Tatkal Rush Demands
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
          Engineered with Redis Caching, BullMQ worker queues, MongoDB indexed queries, Socket.IO websockets, and cluster load balancing.
        </p>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>Concurrent Active Users</span>
            <Activity className="w-4 h-4 text-orange-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-blue-950 font-mono">
            {metrics.concurrentUsers.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-extrabold mt-1">
            +42% Horizontal Pod Scaling
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>Redis Cache Hit Ratio</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            {metrics.redisHitRate}%
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            L2 Memory Invalidation
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>BullMQ Throughput</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-orange-600 font-mono">
            {metrics.queueThroughput.toLocaleString()} req/s
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Async Worker Pool
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>DB Search Latency</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {metrics.searchLatency} ms
          </p>
          <p className="text-[11px] text-purple-700 font-bold mt-1">
            Indexed Compound Queries
          </p>
        </div>

      </div>

      {/* Interactive Spike Simulator Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
              <span>10:00 AM Tatkal Booking Spike Simulator</span>
              {isSimulatingSpike && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono font-bold animate-pulse">
                  250K USER SPIKE ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Simulate 250,000 simultaneous users hitting the booking queue at 10:00 AM sharp.
            </p>
          </div>

          <button
            onClick={triggerTatkalSpike}
            disabled={isSimulatingSpike}
            className="px-6 py-3 rounded-2xl irctc-gradient-btn font-extrabold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Simulate 10:00 AM Tatkal Rush Spike</span>
          </button>
        </div>

        {/* Live Cluster Diagram */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-blue-950 block mb-1">Nginx Load Balancer</span>
            <p className="text-slate-600 font-medium">Round-Robin distribution across 16 microservices Node.js instances.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-blue-950 block mb-1">Redis Cluster (3 Masters, 3 Replicas)</span>
            <p className="text-slate-600 font-medium">Sub-millisecond train seat inventory cache lookup.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-blue-950 block mb-1">BullMQ Worker Cluster</span>
            <p className="text-slate-600 font-medium">Processes ticket reservations in strictly synchronized FIFO queues.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
