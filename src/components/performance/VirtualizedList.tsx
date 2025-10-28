import React, { memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

interface FeedbackItem {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  time: string;
  restaurant?: string;
}

interface VirtualizedListProps {
  items: FeedbackItem[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  estimateSize?: number;
}

const FeedbackItemComponent = memo(({ item }: { item: FeedbackItem }) => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{item.customer}</h4>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${
                i < item.rating ? 'text-warning fill-current' : 'text-muted'
              }`} 
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{item.comment}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{item.time}</span>
        {item.restaurant && <span>{item.restaurant}</span>}
      </div>
    </CardContent>
  </Card>
));

FeedbackItemComponent.displayName = 'FeedbackItemComponent';

const LoadingItem = memo(() => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-12 w-full mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </CardContent>
  </Card>
));

LoadingItem.displayName = 'LoadingItem';

export const VirtualizedList = memo(({ 
  items, 
  onLoadMore, 
  hasNextPage, 
  isLoading,
  estimateSize = 120 
}: VirtualizedListProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  const { ref: loadMoreRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage && !isLoading && onLoadMore) {
        onLoadMore();
      }
    },
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLastItem = virtualRow.index === items.length;
          const item = items[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={isLastItem ? loadMoreRef : undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLastItem ? (
                hasNextPage ? (
                  <LoadingItem />
                ) : null
              ) : (
                <FeedbackItemComponent item={item} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';