import { motion } from 'framer-motion'

// Skeleton Base Component
export function Skeleton({ className = '', animate = true }) {
    return (
        <motion.div
            className={`bg-gray-200 dark:bg-gray-700/50 rounded ${className}`}
            animate={animate ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
    )
}

// Card Skeleton
export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
        </div>
    )
}

// Stat Card Skeleton
export function StatCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-24" />
        </div>
    )
}

// Table Row Skeleton
export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-[#21262d]">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
        </div>
    )
}

// Pipeline Column Skeleton
export function PipelineColumnSkeleton() {
    return (
        <div className="flex-shrink-0 w-72 bg-gray-100/50 dark:bg-[#0d1117] rounded-xl">
            <div className="p-4 border-b border-gray-200 dark:border-[#30363d]">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-6 rounded-full" />
                </div>
            </div>
            <div className="p-3 space-y-3">
                {[1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// Chart Skeleton
export function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="h-64 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                    <motion.div
                        key={i}
                        className="flex-1"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        <Skeleton className="w-full h-full rounded-t" animate={false} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-12 w-32 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <StatCardSkeleton />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    )
}
