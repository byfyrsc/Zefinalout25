import EventsHub from "@/components/events/EventsHub";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const EventsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Eventos Interativos</h1>
      <p className="text-muted-foreground">Crie e gerencie experiências gamificadas para seus clientes</p>
      <EventsHub />
    </div>
  );
};

export default EventsPage;