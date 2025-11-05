import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  socialMediaOptions,
  transactions,
  modelUsageData,
  categoryUsageData,
  timeSeriesData
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileUploadButton } from "@/components/ui/file-upload-button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  User,
  BarChart2,
  Shield,
  Save,
  Gem,
  Copy,
  Loader,
  Pencil,
  X,
  Search,
  Check,
  DatabaseBackup,
  Info,
  History,
  Trash2,
  Heart,
  Maximize2,
  Music,
  Pause,
  Play,
  Folder,
  File,
  ArrowLeft,
  LogIn,
  RefreshCw,
  FilePlus2 ,
  Link,
  Clock9,
  MessageSquare,
  Share2,
  Boxes,
  Type,
  Code,
  PanelLeftClose,
  Command as KeyboardCommand,
  AlertTriangle,
  Wallet,
  ArrowUpDown,
  Globe,
  Minus,
  Plus,
  Volume2,
  Gauge,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Clock,
  Monitor,
  Chrome,
  Bell,
  Zap,
  AlertCircle,
  ArrowRight,
  Tag,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  ChevronRight,
  Key,
  CreditCard,
  LightbulbIcon,
  FileText, 
  Camera,
  Users,
  Building2,
  InfoIcon,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Upload,
} from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

import { NotificationItem } from "@/lib/types";
import { driveService } from '@/lib/services/driveServices';
import { useRouter } from "next/navigation";
import { Share } from "next/dist/compiled/@next/font/dist/google";
import { DataTable } from "./txn/data-table";
import { columns } from "./txn/columns";
import { StatCard } from "./stat-card";
import Cleave from 'cleave.js/react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label, Label as UILabel } from "@/components/ui/label";
import { useAuth } from "../providers/AuthProvider";


import { authApi } from "@/lib/api/auth";
import { modelsApi, Model } from '@/lib/api/models';
import { feedbackApi } from '@/lib/api/feedback';
import { profileApi } from '@/lib/api/profile';
import { keysApi } from '@/lib/api/keys';
import { paymentApi } from '@/lib/api/payment';

import { useConversationStore, useModelsStore } from '@/stores/models';
import { useSidebarStore, useSelectedModelsStore, useHistoryStore, 
  useLikedMediaStore, LikedMediaItem, useDriveAuthStore, useSharedLinksStore, 
  useVoiceStore, useSettingsStore, useApiKeyStore, usePaymentStore, useAuthStore, 
  useProjectStore, ProjectFile, useTextSizeStore, useCompareModeStore, 
  useCreditsStore} from "@/stores";
import { AlleAILoader } from "../features/AlleAILoader";
import { HistoryItem } from "@/lib/api/history";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

import Papa from "papaparse";

import { chatApi } from "@/lib/api/chat";
import { truncate } from "fs";
import { projectApi } from "@/lib/api/project";
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStreamingTitlesStore } from "@/stores";
import { TextStream } from "@/components/ui/text-stream";
import { useAudioTabStore } from "@/stores/audioTabStore";
import { CardElement, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { useAutoReloadStore } from "@/stores";
import { useAudioCategorySelectionStore } from "@/stores/audioCategorySelectionStore";
import { likedApi } from "@/lib/api/liked";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../ui/animated-modal";


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTabValue?: string;
}

interface SearchHistoryModalProps extends ModalProps {
  currentType: 'chat' | 'image' | 'audio' | 'video';
}

interface AlbumItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  modelName: string;
  timestamp: Date;
  prompt?: string;
}

interface SubscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  currentBalance: number;
  onConfirm: () => void;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  modelName: string;
  showPreview?: boolean;
}

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: DriveFile) => void;
}

interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType: string;
  thumbnailUrl?: string;
  size?: string;
}

interface ShortcutItem {
  action: string;
  shortcut: {
    keys: string[];
  }[];
}

interface LogoutModalProps extends ModalProps {
  mode?: 'current' | 'device';
  deviceInfo?: {
    id: string | number;
    name: string;
    browser: string;
    location: string;
  };
}

const shortcuts: ShortcutItem[] = [
  {
    action: "Start new conversation",
    shortcut: [{ keys: ["Ctrl", "Shift", "O"] }]
  },
  {
    action: "Focus chat input",
    shortcut: [{ keys: ["Shift", "Esc"] }]
  },
  {
    action: "Copy last code block",
    shortcut: [{ keys: ["Ctrl", "Shift", ";"] }]
  },
  {
    action: "Copy last response",
    shortcut: [{ keys: ["Ctrl", "Shift", "C"] }]
  },
  {
    action: "Set custom instructions",
    shortcut: [{ keys: ["Ctrl", "Shift", "I"] }]
  },
  {
    action: "Toggle sidebar",
    shortcut: [{ keys: ["Ctrl", "Shift", "S"] }]
  },
  {
    action: "Delete chat",
    shortcut: [{ keys: ["Ctrl", "Shift", "⌫"] }]
  },
  {
    action: "Show shortcuts",
    shortcut: [{ keys: ["Ctrl", "/"] }]
  }
];

interface ReportModalProps extends ModalProps {
  contentId: string;
  contentType: 'image' | 'text' | 'audio' | 'video';
  contentPreview?: string;
}

const reportCategories = [
  {
    id: 'illegal',
    label: 'Illegal content',
    description: 'Content that violates laws or regulations'
  },
  {
    id: 'explicit',
    label: 'Explicit or inappropriate',
    description: 'NSFW, violence, or disturbing content'
  },
  {
    id: 'harmful',
    label: 'Harmful or dangerous',
    description: 'Content promoting harm or dangerous activities'
  },
  {
    id: 'misuse',
    label: 'AI misuse',
    description: 'Malicious use of AI technology'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other violations not listed above'
  }
];

interface NotificationModalProps {
  notification: NotificationItem | null;
  open: boolean;
  onClose: () => void;
}

const typeIcons = {
  feature: Zap,
  security: Shield,
  update: Bell,
  alert: AlertCircle,
  info: Info,
};

const priorityColors = {
  low: 'bg-slate-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium' | 'ghost2';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
  title: string;
  message: string | React.ReactNode;
  type?: 'warning' | 'error' | 'success' | 'info' | 'upgrade' | 'standard' | 'plus';
  actions?: ActionButton[];
  metadata?: {
    plan?: string;
    requiredTokens?: number;
    currentTokens?: number;
    models?: string[];
    link?: {
      text: string;
      url: string;
    };
  };
  showConfetti?: boolean;
}

// type UserPlan = 'free' | 'standard' | 'plus';
type UserPlan = 'free' | 'standard' | 'plus' | 'custom' | 'pro';
type TimeRange = '24h' | '7d' | '30d' | '90d';
type ChartType = 'bar' | 'pie' | 'line';


export function FeedbackModal({ isOpen, onClose }: ModalProps) {
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState("");
  const [wantsFutureContact, setWantsFutureContact] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  ;

  const emojis = [
    { rating: 1, emoji: "😟" },
    { rating: 2, emoji: "🙂" },
    { rating: 3, emoji: "😐" },
    { rating: 4, emoji: "😊" },
    { rating: 5, emoji: "😄" },
  ];

  const handleSubmit = async () => {
    if (!selectedRating) {
      toast.error('Please select a rating and submit');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackApi.submitFeedback({
        message: feedback,
        rating: selectedRating,
        anonymous: wantsFutureContact
      });

      toast.success('Your feedback has been submitted')
      // Reset form
      setSelectedRating(null);
      setFeedback("");
      setWantsFutureContact(false);
      onClose();
    } catch (error) {
      // console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback, try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95%] xs:max-w-md rounded-md">
        <DialogHeader className="flex flex-row items-center justify-between relative">
          <DialogTitle>We value your feedback</DialogTitle>
          <kbd className="hidden lg:inline-flex absolute right-4 -top-4 pointer-events-none  h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">esc</span>
          </kbd>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            {/* <p className="text-sm">We would love to hear how was your experience with our agent</p> */}

            <div className="flex justify-between">
              {emojis.map(({ rating, emoji }) => (
                <motion.button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={cn(
                    "p-2 text-xl xs:p-4 xs:text-2xl rounded-lg border border-borderColorPrimary hover:bg-[#ad933470] transition-colors",
                    selectedRating === rating
                      ? "border-2 border-borderColorPrimary bg-[#ad933470]"
                      : "border-input"
                  )}
                  whileTap={{ scale: 1.2, rotate: 10 }}
                  animate={
                    selectedRating === rating ? { scale: 1.1 } : { scale: 1 }
                  }
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm">
              Your thoughts help us improve our platform and provide you with
              the best possible experience.{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              className="min-h-[100px] focus:outline-none focus:border-borderColorPrimary"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {feedback.length}/500 characters left
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="future-contact"
              checked={wantsFutureContact}
              onCheckedChange={(checked) =>
                setWantsFutureContact(checked as boolean)
              }
            />
            <label htmlFor="future-contact" className="text-sm leading-none">
              I would like to remain anonymous.
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Done'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TextSizeModal({ isOpen, onClose }: ModalProps) {
  const { size, setSize } = useTextSizeStore();
  const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24, 26];

  const handleSizeChange = (newSize: string) => {
    setSize(Number(newSize));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[20rem]">
        <DialogHeader className="flex flex-row items-center justify-between relative">
          <DialogTitle className="text-sm">
            Font Options
            <kbd className="absolute right-4 -top-[0.6rem] pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">esc</span>
            </kbd>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs">Font Size</label>
            <Select value={size.toString()} onValueChange={handleSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-backgroundSecondary">
                {fontSizes.map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                    className="cursor-pointer"
                  >
                    {size} px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            className="w-full p-2 text-sm text-center rounded-md bg-primary/10 hover:bg-primary/20 text-primary"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LogoutModal({ isOpen, onClose, mode = 'current', deviceInfo }: LogoutModalProps) {

   const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      onClose();
    } catch (error) {
      // console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'current' ? 'Logout' : `Logout Device`;
  const description = mode === 'current' 
    ? "You will be logged out of your current session. You'll need to log in again to access your account."
    : `This will end the session on your ${deviceInfo?.name}. Any ongoing operations on that device will be interrupted.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between relative">
          <DialogTitle>{title}</DialogTitle>
          <kbd className="absolute right-4 -top-4 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">esc</span>
          </kbd>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'device' && deviceInfo && (
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 rounded-full bg-secondary/10">
                <Monitor className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{deviceInfo.name}</p>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <Globe className="h-3 w-3" />
                  <span>{deviceInfo.location}</span>
                  <span>•</span>
                  <Chrome className="h-3 w-3" />
                  <span>{deviceInfo.browser}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {description}
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (mode === 'current') {
                  handleLogout();
                } else if (deviceInfo) {
                  // // console.log(`Logging out device: ${deviceInfo.id}`);
                }
                onClose();
              }}
            >
              {mode === 'current' ? 'Logout' : 'Logout Device'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ModelSelectionModal({ isOpen, onClose }: ModalProps) {
  const currentPage = useSidebarStore((state) => state.currentPage);
  const { selectedModels, tempSelectedModels, setTempSelectedModels, saveSelectedModels, getSelectedModelNames } = useSelectedModelsStore();
  const [filterType, setFilterType] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null); // Track which model is being favorited
  const pathname = usePathname();

  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showLessModelPrompt, setShowLessModelPrompt] = useState(false);
  const [promptConfig, setPromptConfig] = useState<any>(null);
  const { activeTab, setActiveTab } = useAudioTabStore();
  const { setCategoryModel } = useAudioCategorySelectionStore();

  
  // Store models for each audio tab separately
  const [ttsModels, setTtsModels] = useState<string[]>([]);
  const [sttModels, setSttModels] = useState<string[]>([]);
  const [agModels, setAgModels] = useState<string[]>([]);
  
  // const userPlan = useAuthStore((state) => state.plan) as UserPlan;
  const rawUserPlan = useAuthStore((state) => state.plan) as string;

  // Create a function to parse plan and check permissions
  const getPlanPermissions = React.useMemo(() => {
    // Default permissions
    const permissions = {
      baseUserPlan: 'free' as UserPlan,
      contentTypes: {
        chat: false,
        image: false,
        audio: false,
        video: false
      }
    };
    
    if (!rawUserPlan) return permissions;
    
    const planParts = rawUserPlan.split('_');
    
    // Set base user plan (first part of the plan name)
    permissions.baseUserPlan = planParts[0] as UserPlan;

      // For non-custom plans, we don't need to check content types
      if (permissions.baseUserPlan !== 'custom' && permissions.baseUserPlan !== 'pro') {
        return permissions;
      }
        
      // For custom plans, check which content types are included
      // Special case for unlimited
      if (rawUserPlan === 'custom_unlimited' || 
        rawUserPlan.includes('custom_chat_image_audio_video')) {
      permissions.contentTypes = {
        chat: true,
        image: true,
        audio: true,
        video: true
      };
    } else {
      // Check for specific content types
      permissions.contentTypes.chat = planParts.includes('chat');
      permissions.contentTypes.image = planParts.includes('image');
      permissions.contentTypes.audio = planParts.includes('audio');
      permissions.contentTypes.video = planParts.includes('video');
    }

    return permissions;
    }, [rawUserPlan]);

    const userPlan = getPlanPermissions.baseUserPlan;

  const { 
    chatModels, 
    imageModels, 
    audioModels, 
    videoModels,
    isLoading,
    error,
    setChatModels,
    setImageModels,
    setAudioModels,
    setVideoModels,
  } = useModelsStore();

  // Plan limits
  const MODEL_LIMITS: Record<UserPlan, number> = {
    free: 2,
    standard: 3,
    plus: 5,
    custom: 5,
    pro: 5,
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, model: Model) => {
    e.stopPropagation(); // Prevent model selection when clicking favorite
    setFavoriteLoading(model.model_uid); // Set loading state for this model

    try {
      await modelsApi.toggleFavorite(model.model_uid, !model.favorite);
      
      // Update the models in the store with the new favorite state
      const updateModels = (models: Model[]) => 
        models.map(m => 
          m.model_uid === model.model_uid 
            ? { ...m, favorite: !m.favorite }
            : m
        );

      switch (currentPage) {
        case "chat":
          setChatModels(updateModels(chatModels));
          break;
        case "image":
          setImageModels(updateModels(imageModels));
          break;
        case "audio":
          setAudioModels(updateModels(audioModels));
          break;
        case "video":
          setVideoModels(updateModels(videoModels));
          break;
      }
    } catch (error) {
      // console.error('Failed to toggle favorite:', error);
      toast.error('Failed to favorite model');
    } finally {
      setFavoriteLoading(null); // Clear loading state
    }
  };

  const checkModelSelectionRestrictions = (modelId: string) => {
    const model = getModelsForPage().find(m => m.model_uid === modelId);
    const currentContentType = currentPage as keyof typeof getPlanPermissions.contentTypes;
    
    // For custom plans, check if the current content type is included
    // If included, use 'plus' permissions, otherwise use 'free' permissions
    const effectiveUserPlan = 
      userPlan === 'custom' || userPlan === 'pro'
        ? (getPlanPermissions.contentTypes[currentContentType] ? 'plus' : 'free')
        : userPlan;
    
    // Check for premium model restriction
    if ((model?.model_plan === 'standard' && effectiveUserPlan === 'free') || 
        (model?.model_plan === 'plus' && (effectiveUserPlan === 'free' || effectiveUserPlan === 'standard'))) {
      
      // Determine the required plan based on the model's plan
      const requiredPlan = model?.model_plan === 'standard' ? 'Standard' : 'Plus';
      
      setPromptConfig({
        title: `${requiredPlan} Model`,
        message: `Upgrade Plan to use this model`,
        type: `${requiredPlan.toLowerCase() === 'standard' ? 'standard' : 'plus'}`,
        metadata: {
          plan: requiredPlan,
          models: [model.model_name],
        },
        actions: [
          {
            label: "OK",
            onClick: () => setShowPromptModal(false),
            variant: "outline"
          },
          {
            label: "Upgrade Plan",
            onClick: () => {
              setPlansModalOpen(true);
              setShowPromptModal(false);
            },
            variant: "premium",
            icon: <Gem className="h-4 w-4" />
          }
        ]
      });
      setShowPromptModal(true);
      return false;
    }
  
    // Check for model count limit
    const newCount = tempSelectedModels.includes(modelId) 
      ? tempSelectedModels.length - 1 
      : tempSelectedModels.length + 1;
    
    if (newCount > MODEL_LIMITS[effectiveUserPlan]) {
      const planUpgrade = effectiveUserPlan === 'free' ? 'Standard' : 'Plus';
      
      setPromptConfig({
        title: "Model Limit Reached",
        message: (
          <>
            Your current plan allows up to{' '}
            <span className="font-bold text-foreground">{MODEL_LIMITS[effectiveUserPlan]} models</span> per conversation
            {effectiveUserPlan !== 'plus' ? (
              <>
                . Upgrade to{' '}
                {effectiveUserPlan === 'free' ? 'Standard or Plus' : 'Plus'} to use more models.
              </>
            ) : (
              '.'
            )}
          </>
        ),
        type: "warning",
        metadata: {
          link: {
            url: '/faq/3742473-others/model-limits',
            text: 'Learn more'
          },
          plan: planUpgrade,
          models: [
            ...tempSelectedModels.map(id => {
              const model = getModelsForPage().find(m => m.model_uid === id);
              return model?.model_name || id;
            }),
            model?.model_name || modelId
          ],
        },
        actions: [
          {
            label: "OK",
            onClick: () => setShowPromptModal(false),
            variant: "outline"
          },
          ...(effectiveUserPlan !== 'plus' ? [
            {
              label: `Upgrade Plan`,
              onClick: () => {
                setPlansModalOpen(true);
                setShowPromptModal(false);
              },
              variant: "premium",
              icon: <Gem className="h-4 w-4" />
            }
          ] : [])
        ]
      });
      
      setShowPromptModal(true);
      return false;
    }
  
    return true;
  };

  // Initialize tab models when modal opens
  useEffect(() => {
    if (isOpen && currentPage === "audio") {
      // Filter models by category
      const tts = audioModels
        .filter(model => model.model_category === 'tts')
        .map(model => model.model_uid)
        .filter(uid => selectedModels.audio.includes(uid));
      
      const stt = audioModels
        .filter(model => model.model_category === 'stt')
        .map(model => model.model_uid)
        .filter(uid => selectedModels.audio.includes(uid));
      
      const ag = audioModels
        .filter(model => model.model_category === 'ag')
        .map(model => model.model_uid)
        .filter(uid => selectedModels.audio.includes(uid));
      
      setTtsModels(tts);
      setSttModels(stt);
      setAgModels(ag);
      
      // Set temp models based on active tab
      if (activeTab === 'tts') setTempSelectedModels(tts);
      else if (activeTab === 'stt') setTempSelectedModels(stt);
      else if (activeTab === 'ag') setTempSelectedModels(ag);
    } else if (isOpen) {
      // For non-audio pages, just use the regular selection
      setTempSelectedModels(selectedModels[currentPage as keyof typeof selectedModels] || []);
    }
  }, [isOpen, currentPage, activeTab, selectedModels]);

  useEffect(() => {
    // console.log('The current page is', currentPage);
    setSearchQuery("");
    setFilterType("all");
  }, [currentPage]);

  // Update the tab-specific model arrays when tempSelectedModels changes
  useEffect(() => {
    if (currentPage === "audio") {
      if (activeTab === 'tts') {
        setTtsModels(tempSelectedModels);
      } else if (activeTab === 'stt') {
        setSttModels(tempSelectedModels);
      } else if (activeTab === 'ag') {
        setAgModels(tempSelectedModels);
      }
    }
  }, [tempSelectedModels, currentPage, activeTab]);

  const handleSave = () => {

    if (tempSelectedModels.length < 1) {
      setShowLessModelPrompt(true);
      return;
    }
    if (currentPage === "audio") {
      // Assume only one model can be selected at a time for each category
      const selectedModelId = tempSelectedModels[0];
      const model = audioModels.find(m => m.model_uid === selectedModelId);
      if (
        model &&
        model.model_category &&
        ['tts', 'stt', 'ag'].includes(model.model_category)
      ) {
        setCategoryModel(model.model_category as 'tts' | 'stt' | 'ag', selectedModelId);
      }
      saveSelectedModels('audio');
    } else {
      saveSelectedModels(currentPage as 'chat' | 'image' | 'audio' | 'video');
    }
    onClose();
  };

  const toggleModelSelection = (modelId: string) => {

    // Special handling for audio models - only one can be selected at a time
    if (currentPage === "audio") {
      if (tempSelectedModels.includes(modelId)) {
        // If clicking on the already selected model, deselect it
        const updatedModels = tempSelectedModels.filter(id => id !== modelId);
        setTempSelectedModels(updatedModels);
        return;
      } else {
        // Replace the current selection with the new model
        if (checkModelSelectionRestrictions(modelId)) {
          setTempSelectedModels([modelId]);
        }
        return;
      }
    }

    if (checkModelSelectionRestrictions(modelId)) {
      setTempSelectedModels(
        tempSelectedModels.includes(modelId)
          ? tempSelectedModels.filter(id => id !== modelId)
          : [...tempSelectedModels, modelId]
      );
    }
  };

  const getModelsForPage = () => {
    switch (currentPage) {
      case "chat":
        return chatModels || [];
      case "image":
        return imageModels || [];
      case "audio":
        return audioModels || [];
      case "video":
        return videoModels || [];
      default:
        return [];
    }
  };

  // Filter models based on current audio tab when on audio page
  const filteredAudioModels = useMemo(() => {
    if (currentPage !== "audio") return [];
    
    return (audioModels || []).filter(model => 
      model.model_category === activeTab
    );
  }, [audioModels, activeTab, currentPage]);

  const models = getModelsForPage();

  const filterOptions = [
    {
      value: "all",
      label: "All models",
    },
    {
      value: "free",
      label: "Free",
    },
    {
      value: "standard",
      label: "Standard",
      icon: '/icons/silver-alle-ai.webp'
    },
    {
      value: "plus",
      label: "Plus",
      icon: '/icons/gold-alle-ai.webp'
    },
    {
      value: "favorite",
      label: "My favorite",
    },
  ];

  // Filter and search models
  const filteredModels = React.useMemo(() => {
    if (!models) return [];

    // When on audio page, filter by the active tab
    let modelsToFilter = currentPage === "audio" 
      ? filteredAudioModels
      : models;
    
    return modelsToFilter.filter((model) => {
      const matchesSearch =
        model.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.model_provider?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterType === "all" || 
        (filterType === "favorite" ? model.favorite : model.model_plan === filterType);
      
      return matchesSearch && matchesFilter;
    });
  }, [models, filteredAudioModels, searchQuery, filterType, currentPage]);

  const getModelTypeText = () => {
    switch (currentPage) {
      case "chat":
        return "Select at least 2 Chat Models";
      case "image":
        return "Select at least 1 Image Model";
      case "audio":
        if (activeTab === "tts") return "Select only 1 Text-to-Speech Model";
        if (activeTab === "stt") return "Select only 1 Speech-to-Text Model";
        if (activeTab === "ag") return "Select only 1 Audio Generation Model";
        return "Select only 1 Audio Model";
      case "video":
        return "Select at least 1 Video Model";
      default:
        return "Select Models";
    }
  };

  const isSelectionValid = () => {
    switch (currentPage) {
      case "chat":
        return tempSelectedModels.length >= 2;
      case "image":
      case "video":
        return tempSelectedModels.length >= 1;
      case "audio":
        return tempSelectedModels.length === 1;
      default:
        return true;
    }
  };

  const getRequiredInfo = (pathname: string): string => {
    switch (true) {
      case pathname.startsWith('/chat'):
        return 'at least 2 models';
      case pathname.startsWith('/image'):
      case pathname.startsWith('/video'):
        return 'at least 1 model';
      case pathname.startsWith('/audio'):
        return '1 model';
      default:
        return 'at least 2 models';
    }
  };

  const handleRemoveAll = () => {
    setTempSelectedModels([]);
  };

  const pageLabels = {
    image: "Image",
    audio: "Audio",
    video: "Video",
  };
  
  const label = pageLabels[currentPage as keyof typeof pageLabels] || "Chat";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg sm:max-w-2xl md:max-w-3xl rounded-md" id="tooltip-select-menu">
          <DialogHeader className="space-y-4 relative">
            <DialogTitle className="">Model Selection</DialogTitle>

            {/* Selected Models */}
            <div className="space-y-2">
              {tempSelectedModels.length > 0 && (
                <>
                  <label className="text-sm font-medium">Selected {label} Model(s)</label>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedModels.map((modelId) => {
                      const model = models.find((m) => m.model_uid === modelId);
                      return (
                        <Badge
                          variant="outline"
                          key={modelId}
                          className={`${model?.model_plan === 'standard' ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' : model?.model_plan === 'plus' ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90' : ''  } 
                            px-2 py-1 flex items-center gap-1 border-borderColorPrimary rounded-md cursor-pointer hover:bg-hoverColorPrimary text-accent-foreground`}
                          
                        >
                          {model?.model_name}
                          {/* {model?.model_plan === 'standard' ? (
                            <Image
                            src={'/svgs/logo-desktop-mini.webp'}
                              height={10}
                              width={10}
                              alt="silver-alle-ai"
                              className="bg-gradient-to-r from-gray-300/90 to-gray-400/90 rounded-sm"
                            />
                          ): model?.model_plan === 'plus' ? (
                            <Image
                            src={'/icons/gold-alle-ai.webp'}
                              height={10}
                              width={10}
                              alt="gold-alle-ai"
                            />
                          ): ''} */}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-700"
                            onClick={() => toggleModelSelection(modelId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between">
              <div className="text-sm font-medium inline-flex items-center gap-2">
                {isSelectionValid() && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {getModelTypeText()}
              </div>
              <div className="flex flex-row-reverse sm:flex-row items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models"
                    className="pl-8 w-[200px] focus-visible:outline-none focus:border-borderColorPrimary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all" onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px] border-borderColorSecondary">
                    <SelectValue placeholder="All models" />
                  </SelectTrigger>
                  <SelectContent className="bg-backgroundSecondary">
                    {filterOptions.map((option) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={option.value}
                        value={option.value}
                      >
                        <div className="flex items-center justify-between w-full">
                          {option.label}
                          {(option.value === 'standard' || option.value === 'plus') && (
                            <div className={`inline-flex items-center ml-1
                              ${option.value === 'standard' 
                                ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' 
                                : 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90'} 
                              rounded-sm p-0.5`}>
                              <Image
                                src={'/svgs/logo-desktop-mini.webp'}
                                height={10}
                                width={10}
                                alt={`${option.value}-alle-ai`}
                              />
                            </div>
                          )}
                          {option.value === 'favorite' && (<Heart className ='ml-1 w-4 fill-red-500 text-red-500'/>)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <kbd className="absolute right-4 -top-[1.6rem] pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">esc</span>
            </kbd>
          </DialogHeader>

          {/* Audio Tabs - Only show for audio page using shadcn Tabs */}
          {currentPage === "audio" && (
            <Tabs value={activeTab} onValueChange={(value) => {
              // Update the selectedModels.audio with the current tab's models first
              const tabModels = activeTab === 'tts' ? ttsModels : 
                                 activeTab === 'stt' ? sttModels : 
                                 agModels;
              
              // Save the current tab's models
              if (activeTab === 'tts') {
                setTtsModels(tempSelectedModels);
              } else if (activeTab === 'stt') {
                setSttModels(tempSelectedModels);
              } else if (activeTab === 'ag') {
                setAgModels(tempSelectedModels);
              }
              
              // Switch to new tab
              setActiveTab(value as 'tts' | 'stt' | 'ag');
              
              // Set the tempSelectedModels to the models for the new tab
              if (value === 'tts') {
                setTempSelectedModels(ttsModels);
              } else if (value === 'stt') {
                setTempSelectedModels(sttModels);
              } else if (value === 'ag') {
                setTempSelectedModels(agModels);
              }
            }} className="w-full mb-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger className="data-[state=active]:bg-tabBackgroundColor" value="tts">Text-to-Speech</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-tabBackgroundColor" value="stt">Speech-to-Text</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-tabBackgroundColor" value="ag">Audio Generation</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Model Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <AlleAILoader size="sm" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              {error}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No models available
            </div>
          ) : (
            <ScrollArea className="h-[20rem] pr-4 overflow-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 overflow-hidden">
                {filteredModels.map((model) => (
                  <div
                    key={model.model_uid}
                    onClick={() => toggleModelSelection(model.model_uid)}
                    title={`${model.model_name}`}
                    className={cn(
                      "relative flex items-center gap-3 p-4 border border-borderColorPrimary rounded-lg cursor-pointer hover:bg-accent/50 transition-colors select-none",
                      tempSelectedModels.includes(model.model_uid) &&
                        "border-primary bg-accent"
                    )}
                  >
                    {model.model_plan === 'standard' ? (
                      <div className="absolute top-0 right-0">
                        <div className="relative flex items-center gap-1 bg-gradient-to-r from-gray-300/90 to-gray-400/90 text-[10px] font-medium text-white pl-2 pr-2 py-0.5 rounded-tr-md rounded-bl-lg">
                          {/* <Gem className="h-2.5 w-2.5" /> */}
                          <Image
                            src={'/svgs/logo-desktop-mini.webp'}
                            height={10}
                            width={10}
                            alt="gold-alle-ai"
                          />
                        </div>
                      </div>
                    ): model.model_plan === 'plus' ? (
                      <div className="absolute top-0 right-0">
                        <div className="relative flex items-center gap-1 bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 text-[10px] font-medium text-white pl-2 pr-2 py-0.5 rounded-tr-md rounded-bl-lg">
                          {/* <Gem className="h-2.5 w-2.5" /> */}
                          <Image
                            src={'/svgs/logo-desktop-mini.webp'}
                            height={10}
                            width={10}
                            alt="gold-alle-ai"
                          />
                        </div>
                      </div>
                    ): ''}
                    <Image
                      src={model.model_image}
                      height={8}
                      width={8}
                      alt={model.model_name}
                      className="w-8 h-8 rounded-md"
                    />
                    <div className="overflow-auto scrollbar-thin scrollbar-none">
                      <h3 className="font-small text-xs whitespace-nowrap">
                        {model.model_name}
                      </h3>
                      <p className="text-xs flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                        {model.model_provider}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleFavoriteToggle(e, model)}
                      className={cn(
                        "absolute bottom-1 right-1 p-1 rounded-full hover:bg-accent/50",
                        model.favorite ? "text-red-500" : "text-gray-400"
                      )}
                      disabled={favoriteLoading === model.model_uid}
                    >
                      {favoriteLoading === model.model_uid ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        <Heart
                          className={cn(
                            "h-3 w-3",
                            model.favorite && "fill-current"
                          )}
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Update the buttons section */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleRemoveAll}
              className="hover:text-red-600"
            >
              Remove all
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!isSelectionValid()}
              className={!isSelectionValid() ? "opacity-50" : ""}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
      {promptConfig && (
        <PromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          {...promptConfig}
        />
      )}

      <PromptModal
        isOpen={showLessModelPrompt}
        onClose={() => setShowLessModelPrompt(false)}
        title=""
        message={<>Please select<span className="font-bold text-foreground">${getRequiredInfo(pathname)}</span> to start a conversation</>}
        metadata={{
          link: {
            text: "Learn why",
            url: "/faq/3742473-others/models-selection"
          }
        }}
        actions={[
          {
            label: "Close",
            onClick: () => setShowLessModelPrompt(false),
            variant: "outline"
          },
          {
            label: "Select Models",
            onClick: () => {
              setShowLessModelPrompt(false);
            },
            variant: "default"
          }
        ]}
      />
    </>
  );
}

export function SettingsModal({ isOpen, onClose, defaultTabValue }: ModalProps) {
  const { theme, setTheme } = useTheme();
  const { selectedModels, inactiveModels, isLoadingLatest } = useSelectedModelsStore();
  const { isLoading } = useModelsStore();
  const { size, setSize } = useTextSizeStore();
  const [disabled, setDisabled] = useState(true);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = React.useState(false);
  const [logoutAllModalOpen, setLogoutAllModalOpen] = React.useState(false);
  const [manageSharedLinksOpen, setManageSharedLinksOpen] = React.useState(false);
  ;
  const { isAuthenticated } = useDriveAuthStore();
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const voiceSettings = useVoiceStore((state) => state.settings);
  const availableVoices = useVoiceStore((state) => state.availableVoices);
  const { setVoice, setPitch, setRate, setVolume } = useVoiceStore();
  const [activeChart, setActiveChart] = useState<ChartType>('bar');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  // const [isLoading, setIsLoading] = useState(false);
  const [logoutDeviceId, setLogoutDeviceId] = useState<string | number | null>(null);
  const [isDevicesOpen, setIsDevicesOpen] = useState(true);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const { isCompareMode } = useCompareModeStore();

  // Calculate active models count
  const activeModelsCount = selectedModels.chat.filter(
    modelId => !inactiveModels.includes(modelId)
  ).length;

  const [promptConfig, setPromptConfig] = useState<any>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  const { personalization, setPersonalizationSetting } = useSettingsStore();
  const { plan, user } = useAuthStore();
  const isFreeUser = plan === 'free' || !plan;

  // Effect to handle summary toggle based on active models
  useEffect(() => { 

    
    
    if ( activeModelsCount < 2) {
      
      if(activeModelsCount === 0){
        return;
      }

      const { isCompareMode, setIsCompareMode } = useCompareModeStore.getState();
      if (!isCompareMode) {
        return;
      }

      setIsCompareMode(false);     
      setPersonalizationSetting('summary', false);
    }

  }, [activeModelsCount]);

  // Group voices by language/category with safety checks
  const voiceCategories = useMemo(() => {
    return availableVoices.reduce((acc, voice) => {
      if (!voice?.lang) return acc;
      
      const category = voice.lang.split('-')[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(voice);
      return acc;
    }, {} as Record<string, SpeechSynthesisVoice[]>);
  }, [availableVoices]);

  // Add useEffect to initialize voices
  useEffect(() => {
    const initVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        useVoiceStore.getState().initVoices();
      }
    };

    // Try to get voices immediately
    initVoices();

    // Also listen for the voiceschanged event
    window.speechSynthesis.addEventListener('voiceschanged', initVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', initVoices);
    };
  }, []);

  const settingsData = {
    general: {
      theme: {
        title: "Theme",
        value: theme,
      },
      textSize: {
        title: "Text size",
        value: `${size} px`,
      },
    },
    personalization: {
      // summary: {
      //   title: "Compare",
      //   description:
      //   "Get a concise overview of all AI responses. Summarizes and distills the key points from each AI model for easy understanding",
      //   enabled: isCompareMode,
      // },
      personalizedAds: {
        title: "Sponsored content",
        description: "See relevant contents based on your prompt and responses. Turning this off will disable ads.",
        enabled: personalization.personalizedAds,
      },
    },
    data_controls: {
      // sharedLinks: {
      //   title: "Shared links",
      //   description: "",
      //   action: "Manage",
      // },
      transactionHistory: {
        title: "Transactions",
        description: "",
        action: "View",
      },
      // extportMyData: {
      //   title: "Export data",
      //   description: "",
      //   action: "Export",
      // },
      deleteMyAccount: {
        title: "Delete account",
        description: "",
        action: "Delete",
      },
    },
    linked_apps: {
      google_drive: {
        title: "Google Drive",
        icon: <Image src={'/icons/google-drive.webp'} alt="google_drive_logo" width={16} height={16} /> ,
        description: "Upload Google Docs, Sheets, Slides and other files.",
        action: isAuthenticated ? "Unlink" : "Link"
      },
      one_drive: {
        title: "One Drive",
        icon: <Image src={'/icons/onedrive.webp'} alt="google_drive_logo" width={16} height={16} /> ,
        description: "Upload Microsoft Word, Excel, PowerPoint and other files.",
        action: "Link"
      },
      dropbox: {
        title: "Dropbox",
        icon: <Image src={'/icons/dropbox.webp'} alt="google_drive_logo" width={16} height={16} /> ,
        description: "Upload Docs and other files.",
        action: "Link"
      },
    },
    analytics: {
      myAnalytics: {
        title: "Coming soon...",
        description: "Gain insights and track your usage with personalized analytics.",
      },
    },
    security: {
      logoutAll: {
        title: "Log out of all devices",
        description:
          "Log out from all active sessions on every device, including your current one. Other devices may take up to 30 minutes to be logged out.",
        action: "Log out",
      },
      devices: {
        title: "Connected Devices",
        description: "Manage individual device access to your account",
        activeDevices: [
          {
            id: 1,
            name: "MacBook Pro",
            browser: "Chrome",
            location: "San Francisco, US",
            lastActive: "Active now",
            device: "desktop",
            current: true,
          },
          {
            id: 2,
            name: "iPhone 13",
            browser: "Safari",
            location: "New York, US",
            lastActive: "2 hours ago",
            device: "mobile",
            current: false,
          },
          {
            id: 3,
            name: "iPad Air",
            browser: "Safari",
            location: "London, UK",
            lastActive: "1 day ago",
            device: "tablet",
            current: false,
          }
        ],
      },
    },
  };

  const tabs = [
    {
      value: "general",
      label: "General",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      value: "personalization",
      label: "Personalization",
      icon: <User className="h-4 w-4" />,
    },
    {
      value: "data controls",
      label: "Data controls",
      icon: <DatabaseBackup className="h-4 w-4" />,
    },
    {
      value: "linked apps",
      label: "Linked apps",
      icon: <Boxes className="h-4 w-4" />,
    },
    {
      value: "analytics",
      label: "My Analytics",
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      value: "security",
      label: "Security",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  const handleGoogleDriveAction = async () => {
    if (isAuthenticated) {
      // Handle unlinking
      try {
        await driveService.signOut();
        useDriveAuthStore.getState().clearAuth();
        
        toast.success('Google Drive unlinked');
      } catch (error) {
        // console.error('Failed to unlink Google Drive:', error);
        toast.error('Failed to unlinked Google Drive');

      }
    } else {
      setShowDriveModal(true);
    }
  };

  const handleSwitchChange = async (key: keyof typeof personalization, checked: boolean) => {
    if (activeModelsCount < 2) {
      setShowSummaryPrompt(true);
      return;
    }

    if (key === "summary") {
      if (isFreeUser) {
        setPromptConfig({
          title: "Upgrade Required",
          message: "Please upgrade your plan to enable the Compare & Comparison feature.",
          actions: [
            {
              label: "Upgrade Plan",
              onClick: () => {
                setShowPromptModal(false);
                setPlansModalOpen(true)},
                variant: "outline"
            },
          ],
        });
        setShowPromptModal(true);
        return;
      }
    
      // Use the Compare Mode store instead of the API call
      const { setIsCompareMode } = useCompareModeStore.getState();
      
      // Update the compare mode state
      setIsCompareMode(checked);
      
      // Still update the local personalization setting
      setPersonalizationSetting(key, checked);
    }
  };

  function safeDisplayLanguageName(languageCode: string) {
    try {
      return new Intl.DisplayNames(['en'], { type: 'language' }).of(languageCode) || languageCode;
    } catch (error) {
      // console.error('Error displaying language name:', error);
      return languageCode; // Fallback to just showing the language code
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl lg:max-w-3xl rounded-md overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between relative border-b border-borderColorPrimary">
            <DialogTitle className="mb-2">Settings</DialogTitle>
            <kbd className="absolute right-4 -top-4 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">esc</span>
            </kbd>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue={`${defaultTabValue ? defaultTabValue : 'general'}`} className="w-full h-full">
              <div className="flex flex-col sm:flex-row gap-4 h-full max-h-[80vh]">
              {/* Sidebar */}
                <div className="w-full sm:w-48 shrink-0">
                  <TabsList className="w-full flex flex-row sm:flex-col h-auto bg-transparent gap-1 sm:space-y-1 overflow-x-auto pb-2 sm:pb-0">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                        className="w-full justify-start gap-2 focus-visible:outline-none data-[state=active]:bg-backgroundSecondary whitespace-nowrap"
                    >
                      {tab.icon}
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2">
                <TabsContent value="general" className="space-y-2">
                  <div className="flex items-center justify-between border-b border-borderColorPrimary">
                    <span className="text-sm">Theme</span>
                    <Select
                      defaultValue={theme}
                      onValueChange={(value) => setTheme(value)}
                    >
                      <SelectTrigger className="w-24 p-2 border-none focus:outline-none focus:border-b">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-backgroundSecondary">
                        <SelectItem
                          className="text-sm cursor-pointer focus:outline-none"
                          value="system"
                        >
                          System
                        </SelectItem>
                        <SelectItem
                          className="text-sm cursor-pointer focus:outline-none"
                          value="light"
                        >
                          Light
                        </SelectItem>
                        <SelectItem
                          className="text-sm cursor-pointer focus:outline-none"
                          value="dark"
                        >
                          Dark
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between border-b border-borderColorPrimary">
                    <span className="text-sm">Text size</span>
                      <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
                      <SelectTrigger className="w-24 p-2 border-none focus:outline-none">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-backgroundSecondary">
                        {[12, 14, 16, 18, 20].map((size) => (
                          <SelectItem
                            key={size}
                            value={size.toString()}
                            className="cursor-pointer focus:outline-none"
                          >
                            {size} px
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="personalization" className="space-y-6">
                  {Object.entries(settingsData.personalization).map(
                    ([key, setting]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between space-x-4 pb-2 border-b border-borderColorPrimary last:border-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {/* {setting.icon && setting.icon} */}
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              {setting.title}
                            </h4>
                          </div>
                          <p className="text-[0.75rem] text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            className="data-[state=unchecked]:bg-borderColorPrimary"
                            checked={setting.enabled}
                            disabled={key === "personalizedAds"}
                            onCheckedChange={(checked) => 
                              handleSwitchChange(
                                key as "summary" | "personalizedAds",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Music className="h-4 w-4 text-primary" />
                          Text-to-Speech Settings
                        </h4>
                        <p className="text-[0.75rem] text-muted-foreground">
                          Customize how the AI speaks to you
                        </p>
                      </div>
                    </div>

                    {/* Main Voice Selection */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Type className="h-4 w-4 text-primary" />
                          Voice
                        </label>
                        <Select
                          value={voiceSettings.voice}
                          onValueChange={setVoice}
                        >
                          <SelectTrigger className="w-full border border-borderColorPrimary">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(voiceCategories).length > 0 ? (
                              Object.entries(voiceCategories).map(([category, voices]) => (
                                <SelectGroup key={category}>
                                  <SelectLabel className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    {/* {new Intl.DisplayNames([category], { type: 'language' }).of(category)} */}
                                    {/* {safeDisplayLanguageName(category)} */}
                                  </SelectLabel>
                                  {voices.map((voice) => (
                                    <SelectItem 
                                      key={voice.voiceURI} 
                                      value={voice.voiceURI}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span>{voice.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {voice.lang}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))
                            ) : (
                              <SelectItem value="default" disabled>
                                <span className="flex items-center gap-2">
                                  <Loader className="h-3 w-3 animate-spin" />
                                  Loading voices...
                                </span>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quick Test Button */}
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your selected voice.");
                          const selectedVoice = availableVoices.find(v => v.voiceURI === voiceSettings.voice);
                          if (selectedVoice) utterance.voice = selectedVoice;
                          window.speechSynthesis.speak(utterance);
                        }}
                        className="w-full gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Test Voice
                      </Button>

                      {/* Advanced Settings Drawer Trigger */}
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="ghost" className="w-full gap-2">
                            <Settings className="h-4 w-4" />
                            Advanced Voice Settings
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent className="px-4">
                          <DrawerHeader>
                            <DrawerTitle>Advanced Voice Settings</DrawerTitle>
                            <DrawerDescription>
                              Fine-tune your voice settings for the perfect experience
                            </DrawerDescription>
                          </DrawerHeader>

                          <div className="grid gap-6 p-4">
                            {/* Pitch Control */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <ArrowUpDown className="h-4 w-4 text-primary" />
                                  Pitch
                                </label>
                                <span className="text-xs text-muted-foreground">
                                  {voiceSettings.pitch.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setPitch(Math.max(0, voiceSettings.pitch - 0.1))}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Slider
                                  value={[voiceSettings.pitch]}
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  onValueChange={([value]) => setPitch(value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setPitch(Math.min(2, voiceSettings.pitch + 0.1))}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Speed Control */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Gauge className="h-4 w-4 text-primary" />
                                  Speed
                                </label>
                                <span className="text-xs text-muted-foreground">
                                  {voiceSettings.rate.toFixed(1)}x
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setRate(Math.max(0.1, voiceSettings.rate - 0.1))}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Slider
                                  value={[voiceSettings.rate]}
                                  min={0.1}
                                  max={10}
                                  step={0.1}
                                  onValueChange={([value]) => setRate(value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setRate(Math.min(10, voiceSettings.rate + 0.1))}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Volume Control */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Volume2 className="h-4 w-4 text-primary" />
                                  Volume
                                </label>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(voiceSettings.volume * 100)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setVolume(Math.max(0, voiceSettings.volume - 0.1))}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Slider
                                  value={[voiceSettings.volume]}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onValueChange={([value]) => setVolume(value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setVolume(Math.min(1, voiceSettings.volume + 0.1))}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Advanced Test Button */}
                            <Button 
                              onClick={() => {
                                const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your selected voice settings.");
                                const selectedVoice = availableVoices.find(v => v.voiceURI === voiceSettings.voice);
                                if (selectedVoice) utterance.voice = selectedVoice;
                                utterance.pitch = voiceSettings.pitch;
                                utterance.rate = voiceSettings.rate;
                                utterance.volume = voiceSettings.volume;
                                window.speechSynthesis.speak(utterance);
                              }}
                              className="w-full gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Test Advanced Settings
                            </Button>
                          </div>

                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Close Advanced Settings</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="data controls" className="space-y-2">
                  {Object.entries(settingsData.data_controls).map(([key, setting]) => (
                    <div
                      key={key}
                      className="border-b border-borderColorPrimary last:border-none"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-small">{setting.title}</h4>
                        <Button
                          variant={key === "google_drive" ? "outline" : setting.action === "Delete" ? "destructive" : "outline"}
                          className={`h-8 rounded-md p-2 text-xs border-borderColorPrimary transition-all`}
                          size="sm"
                          onClick={() => {
                            toast.info('This feature will be available soon!')
                            // if (setting.action === "Delete") {
                            //   setDeleteAccountModalOpen(true);
                            // } else if (setting.action === "Export") {
                            //   setExportModalOpen(true);
                            // } else if (setting.action === "Manage") {
                            //   // setManageSharedLinksOpen(true);
                            // } else if (setting.action === "View") {
                              // setIsTransactionHistoryOpen(true);
                            // }
                          }}
                        >
                          {setting.action}
                        </Button>
                      </div>
                      <p className="text-[0.75rem] text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="linked apps" className="space-y-2">
                  {Object.entries(settingsData.linked_apps).map(([key, setting]) => (
                    <div
                      key={key}
                      className="border-b border-borderColorPrimary last:border-none"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-small flex items-center gap-2">{setting.icon}{setting.title}</h4>
                        <Button
                          variant={setting.action === 'Unlink' ? 'destructive' : 'outline'}
                          className={`h-8 rounded-md p-2 text-xs border-borderColorPrimary transition-all`}
                          size="sm"
                          onClick={() => {
                            if (key === "google_drive") {
                              toast.info('This feature will be available soon!')
                              // handleGoogleDriveAction();
                            } else if (key === "one_drive"){
                              toast.info('This feature will be available soon!')
                              // // console.log('One Drive')
                            } else if (key === "dropbox"){
                              toast.info('This feature will be available soon!')
                              // // console.log('Dropbox')
                            }
                          }}
                        >
                          {setting.action}
                        </Button>
                      </div>
                      <p className="text-[0.75rem] text-muted-foreground mb-2">
                        {setting.description}
                      </p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-primary" />
                          Coming Soon !!
                        </h4>
                        <p className="text-[0.75rem] text-muted-foreground">
                          Gain insights and track your usage with personalized analytics
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <div className="space-y-6">
                    {/* Existing logout all devices section */}
                    <div className="">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-small">
                          {settingsData.security.logoutAll.title}
                        </h4>
                        <Button
                          variant="destructive"
                          className="h-8 rounded-md p-2 text-xs border-borderColorPrimary"
                          size="sm"
                          onClick={() => setLogoutAllModalOpen(true)}
                        >
                          {settingsData.security.logoutAll.action}
                        </Button>
                      </div>
                      <p className="text-[0.75rem] text-muted-foreground">
                        {settingsData.security.logoutAll.description}
                      </p>
                    </div>

                    {/* Advanced Section */}
                    {/* <Collapsible 
                      open={isDevicesOpen}
                      onOpenChange={setIsDevicesOpen}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">Manage Devices</h4>
                          <Badge variant="secondary" className="text-xs">
                            {settingsData.security.devices.activeDevices.length}
                          </Badge>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-secondary/20">
                            {isDevicesOpen ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {isDevicesOpen ? 'Close devices' : 'Show devices'}
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="rounded-md border border-borderColorPrimary"
                        >
                          {settingsData.security.devices.activeDevices.map((device, index) => (
                            <div
                              key={device.id}
                              className={cn(
                                "flex items-center justify-between p-4",
                                index !== settingsData.security.devices.activeDevices.length - 1 && 
                                "border-b border-borderColorPrimary"
                              )}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-full bg-secondary/10">
                                  {device.device === 'desktop' && <Monitor className="h-4 w-4" />}
                                  {device.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                                  {device.device === 'tablet' && <Tablet className="h-4 w-4" />}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    {device.name}
                                    {device.current && (
                                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                                        Current
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                                    <Globe className="h-3 w-3" />
                                    <span>{device.location}</span>
                                    <span>•</span>
                                    <Chrome className="h-3 w-3" />
                                    <span>{device.browser}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{device.lastActive}</span>
                                  </div>
                                </div>
                              </div>
                              {!device.current && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setLogoutDeviceId(device.id)}
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible> */}
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <DataExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
      />
      <LogoutAllDevicesModal
        isOpen={logoutAllModalOpen}
        onClose={() => setLogoutAllModalOpen(false)}
      />
      {/* Add the Google Drive Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onFileSelect={() => {}} // Empty function since we're just using it for authentication
      />
      <SharedLinksModal
        isOpen={manageSharedLinksOpen}
        onClose={() => setManageSharedLinksOpen(false)}
      />
      <TransactionHistoryModal 
        isOpen={isTransactionHistoryOpen} 
        onClose={() => setIsTransactionHistoryOpen(false)} 
      />
      {promptConfig && (
        <PromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          {...promptConfig}
        />
      )}
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
      {/* Single device logout modal */}
      {logoutDeviceId && (
        <LogoutModal 
          isOpen={true}
          onClose={() => setLogoutDeviceId(null)}
          mode="device"
          deviceInfo={settingsData.security.devices.activeDevices.find(d => d.id === logoutDeviceId)}
        />
      )}
      <PromptModal
        isOpen={showSummaryPrompt}
        onClose={() => setShowSummaryPrompt(false)}
        title="NOTICE"
        message={<>At least <span className="font-bold">2 active models</span> are required to enable the Alle-AI Summary.</>}
        actions={[
          {
            label: "Ok",
            onClick: () => setShowSummaryPrompt(false),
            variant: "default"
          }
        ]}
      />
    </>
  );
}

export function UserProfileModal({ isOpen, onClose }: ModalProps) {
  const { user, token, plan, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBillingPortal, setIsLoadingBillingPortal] = useState(false);
  const router = useRouter();


  function formatPlanName(planString: string) {
    // Split the string by underscores
    const parts = planString.split('_');
  
    if (parts.length < 3) {
      return planString; // Return as-is if the format is unexpected
    }
  
    const prefix = parts[0]; // e.g., "custom" or "pro"
    const suffix = parts[parts.length - 1]; // e.g., "monthly" or "yearly"
    const features = parts.slice(1, -1); // Everything between
  
    // Join features with '+' and wrap in parentheses
    const featuresFormatted = features.join('+');
  
    return `${prefix} (${featuresFormatted})`;
  }
  
  function parsePlanDetails(planString: string): { tier: string; cycle?: string; features: string[] } {
    if (!planString || typeof planString !== 'string') {
      return { tier: 'Free', cycle: undefined, features: [] };
    }

    const parts = planString.split('_').filter(Boolean);
    if (parts.length === 0) {
      return { tier: 'Free', cycle: undefined, features: [] };
    }

    const last = parts[parts.length - 1];
    const cycle = last === 'monthly' ? 'Monthly' : last === 'yearly' ? 'Yearly' : undefined;
    const tierRaw = parts[0];
    const tierMap: Record<string, string> = {
      free: 'Free',
      standard: 'Standard',
      plus: 'Plus',
      custom: 'Custom',
      pro: 'Pro',
    };
    const tier = tierMap[tierRaw] || (tierRaw.charAt(0).toUpperCase() + tierRaw.slice(1));

    const featuresStart = 1;
    const featuresEnd = cycle ? parts.length - 1 : parts.length;
    const rawFeatures = parts.slice(featuresStart, featuresEnd);
    const prettify = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const features = rawFeatures.map(prettify);

    return { tier, cycle, features };
  }

  
  // Form state
  const [formData, setFormData] = useState({
    firstname: user?.first_name || '',
    lastname: user?.last_name || '',
    profilePhoto: null as File | null
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstname: user.first_name || '',
        lastname: user.last_name || ''
      }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/webp', 'image/jpg', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {

        toast.error('Invalid file type. Supported files(JPEG, PNG, JPG, WEBP, or GIF)');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large, less than 2MB required');
        return;
      }

      setFormData(prev => ({ ...prev, profilePhoto: file }));
    }
  };

  // Add this function to handle billing portal redirection
  const handleManageSubscription = async () => {
    try {
      setIsLoadingBillingPortal(true);
      const response = await authApi.getBillingPortal(window.location.href);
      if (response.status && response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Something went wrong, please try again');
      }
    } catch (error) {
      toast.error('Something went wrong, check your internet connection');
    } finally {
      setIsLoadingBillingPortal(false);
    }
  };

  const isPaidPlan = 
    typeof plan === 'string' && 
    (plan === 'standard' || plan === 'plus' || plan.includes('standard') || plan.includes('plus') || plan.includes('pro') || plan.includes('custom'));


  const handleEditToggle = async () => {
    if (isEditing) {
      setIsSubmitting(true);
      try {
        const response = await profileApi.updateProfile({
          firstname: formData.firstname,
          lastname: formData.lastname,
          ...(formData.profilePhoto && { profile_photo: formData.profilePhoto })
        });

        // // console.log('Profile update response:', response);
        
        // Update the auth store with new user data
        if (response.status && response.user) {
          setAuth(
            {
              ...user!,  // Spread existing user data
              first_name: response.user.first_name,
              last_name: response.user.last_name,
              photo_url: response.user.photo_url
            },
            token!,
            plan
          );
        }

        toast.success('Profile updated')
        
        setIsEditing(false);
      } catch (error) {
        // console.error('Profile update error:', error);
        toast.error('Faild to update profile');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {onClose(); setIsEditing(false);}}>
        <DialogContent className="max-w-sm sm:max-w-xl rounded-lg sm:rounded-xl shadow-lg">
          <DialogHeader className="flex flex-row items-center justify-between relative">
            <div className="flex flex-col items-center w-full gap-2">
              <AnimatePresence mode="wait">
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage
                      src={formData.profilePhoto 
                        ? URL.createObjectURL(formData.profilePhoto)
                        : user?.photo_url || "/user.jpg"}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {!isEditing && (
                  <div className="absolute -bottom-1 -right-2 text-white rounded-full">
                    {typeof plan === 'string' ? (
                      (() => {
                        const { tier } = parsePlanDetails(plan);
                        return (
                          <Badge
                            variant="default"
                            title={formatPlanName(plan)}
                            className=""
                          >
                            <span className="truncate">{tier}</span>
                          </Badge>
                        );
                      })()
                    ) : (
                      <Badge 
                        variant="default" 
                        className="overflow-hidden"
                      >
                        <span className="relative z-10">Free</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                              style={{ backgroundSize: '200% 100%' }}
                        />
                      </Badge>
                    )}
                  </div>
                  )}
                  
                  {isEditing && (
                    <label 
                      htmlFor="profile-photo" 
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-white" />
                      <input
                        id="profile-photo"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/webp,image/jpg,image/webp,image/gif"
                      />
                    </label>
                  )}
                  {isEditing && formData.profilePhoto && (
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, profilePhoto: null }))}
                      className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="text-center max-w-[16rem] sm:max-w-[22rem]">
                <DialogTitle className="text-md sm:text-xl truncate" title={isEditing ? undefined : `${user?.first_name} ${user?.last_name}`}>
                  {isEditing ? "Edit Profile" : `${user?.first_name} ${user?.last_name}`}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground truncate" title={user?.email}>{user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <div className="absolute right-4 top-4 flex gap-2">
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  className={`px-2 sm:px-3 transition-all duration-200 ${
                    isEditing 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'border-2 border-borderColorPrimary hover:bg-accent'
                  }`}
                  size="sm"
                  onClick={handleEditToggle}
                  disabled={isSubmitting}
                >
                    <div className="flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      <span className='hidden sm:inline'>Edit Profile</span>
                    </div>
                </Button>
              </div>
              )}
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pt-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      First name
                    </label>
                    <Input
                      value={formData.firstname}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        firstname: e.target.value 
                      }))}
                      placeholder="Enter your first name"
                      className="bg-muted/50 border-primary/20 focus:border-primary transition-colors"
                      maxLength={255}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Last name
                    </label>
                    <Input
                      value={formData.lastname}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        lastname: e.target.value 
                      }))}
                      placeholder="Enter your last name"
                      className="bg-muted/50 border-primary/20 focus:border-primary transition-colors"
                      maxLength={255}
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Info className="h-4 w-4" />
                    <span>Profile Photo Requirements</span>
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Accepted formats: JPEG, PNG, JPG, WEBP, GIF</li>
                    <li>• Maximum file size: 2MB</li>
                    <li>• Recommended size: 400x400 pixels</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-primary" />
                      Account
                    </div>
                    <div className="text-sm text-muted-foreground truncate" title={`${user?.first_name} ${user?.last_name}`}>{user?.first_name} {user?.last_name}</div>
                    <div className="text-sm text-muted-foreground truncate" title={user?.email}>{user?.email}</div>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Gem className="h-4 w-4 text-primary" />
                          Plan
                        </div>
                        <div className="mt-1 space-y-1 min-w-0">
                          {typeof plan === 'string' ? (
                            (() => {
                              const { tier, cycle, features } = parsePlanDetails(plan);
                              return (
                                <>
                                  <div className="text-[0.85rem] font-semibold truncate" title={formatPlanName(plan)}>
                                    {tier}{cycle ? ` · ${cycle}` : ''}
                                  </div>
                                  {features.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 max-w-full">
                                      {features.slice(0, 3).map((f, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="default"
                                          className="h-5 px-2 py-0 text-[0.65rem] leading-none rounded-full truncate max-w-[7rem]"
                                          title={f}
                                        >
                                          <span className="truncate">{f}</span>
                                        </Badge>
                                      ))}
                                      {features.length > 3 && (
                                        <Badge
                                          variant="default"
                                          className="h-5 px-1.5 py-0 text-[0.65rem] leading-none rounded-full"
                                        >
                                          +{features.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()
                          ) : (
                            <div className="text-sm font-semibold">Free</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between gap-2 pt-4 border-t">
            {isEditing ? 
            (
              <Button 
                variant={isEditing ? "default" : "outline"}
                className={`px-2 sm:px-3 transition-all duration-200 ${
                  isEditing 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'border-2 border-borderColorPrimary hover:bg-accent'
                }`}
                size="sm"
                onClick={handleEditToggle}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className='hidden sm:inline'>Saving...</span>
                  </div>
                ) : isEditing ? (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span className='hidden sm:inline'>Save Changes</span>
                  </div>
                ) : ''}
              </Button>
            ) : (
              <Button 
                className='p-2 sm:p-3 text-xs sm:text-sm group border-none dark:bg-white dark:text-black bg-black text-white' 
                variant="outline" 
                onClick={() => {
                  if (isPaidPlan) {
                    // handleManageSubscription();
                    router.push('/manage-subscription');
                  } else {
                    setPlansModalOpen(true);
                    onClose();
                  }
                }}
                disabled={isLoadingBillingPortal}
              >
                {isLoadingBillingPortal ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  </>
                ) : (
                  <>
                    <Gem className='w-4 h-4 mr-2'/>
                  </>
                )}
                {isPaidPlan ? "MANAGE SUBSCRIPTION" : "UPGRADE"}
              </Button>
            )}
            <div className='flex gap-4'>
              <Button 
                className='p-2 sm:p-3 text-xs sm:text-sm' 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  onClose(); 
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
    </>
  );
}

export function ReferModal({ isOpen, onClose }: ModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  ;

  const { user } = useAuthStore();



  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan("");
    }
  }, [isOpen]);

  const referralLink = "https://alle.ai/ref="+user?.referral_code?.toUpperCase();
  const stats = {
    friendsReferred: 125,
    cashEarned: 10.00, 
  };

  // Available plans based on earned amount
  const getEligiblePlans = (amount: number) => {
    const plans = [];
    if (amount >= 20) {
      plans.push({ name: 'Standard Monthly', price: 20 });
    }
    if (amount >= 30) {
      plans.push({ name: 'Plus Monthly', price: 30 });
    }
    if (amount >= 200) {
      plans.push({ name: 'Standard Yearly', price: 200 });
    }
    if (amount >= 300) {
      plans.push({ name: 'Plus Yearly', price: 300 });
    }
    return plans;
  };

  const eligiblePlans = getEligiblePlans(stats.cashEarned);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Copied');
  };

  const platforms = [
    {
      name: "whatsapp",
      url: "https://wa.me/?text=",
      Icon: FaWhatsapp,
    },
    {
      name: "twitter",
      url: "https://twitter.com/intent/tweet?text=",
      Icon: FaXTwitter,
    },
    {
      name: "facebook",
      url: "https://www.facebook.com/sharer/sharer.php?u=",
      Icon: FaFacebook,
    },
  ];

  const handleSubscribe = (planName: string, planPrice: number) => {
    setShowConfirmModal(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm sm:max-w-lg rounded-md">
          <DialogHeader className="flex flex-row items-center justify-between relative">
            <DialogTitle>
              Refer & Earn{" "}
              <span className="text-sm text-infoColorPrimary">(coming soon)</span>
              </DialogTitle>
            <kbd className="absolute right-4 -top-4 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">esc</span>
            </kbd>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Invite your friends and earn cash rewards on each successful referral. 
                Use your earnings to subscribe to Alle-AI plans.{' '}
                <a href="#" className="text-infoColorPrimary hover:underline">
                  learn more
                </a>
              </p>

              {/* Stats Display */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.friendsReferred}</p>
                  <p className="text-sm text-muted-foreground">
                    Friends referred
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-infoColorPrimary">£{stats.cashEarned.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Earned cash</p>
                </div>
              </div>

              {/* Subscription Options */}
              {eligiblePlans.length > 0 && (
                <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-inherit">
                  <h3 className="text-sm font-medium mb-2">Available Plans</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    You have enough credit to subscribe to the following plans:
                  </p>
                  <div className="space-y-2">
                    {stats.cashEarned === 20 ? (
                      <Button 
                        className="w-full"
                        onClick={() => handleSubscribe('Standard Monthly', 20)}
                      >
                        Subscribe to Standard Monthly (£20)
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Select 
                          value={selectedPlan}
                          onValueChange={setSelectedPlan}
                        >
                          <SelectTrigger className="bg-transparent border-borderColorPrimary focus-visible:outline-none">
                            <SelectValue placeholder="Select a plan"/>
                          </SelectTrigger>
                          <SelectContent className="bg-backgroundSecondary">
                            {eligiblePlans.map((plan) => (
                              <SelectItem 
                                key={plan.name} 
                                value={plan.name}
                                className="cursor-pointer hover:bg-[#f7fee7]/50 focus-visible:outline-none"
                              >
                                {plan.name} (£{plan.price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          className="w-full"
                          disabled={!selectedPlan}
                          onClick={() => {
                            const plan = eligiblePlans.find(p => p.name === selectedPlan);
                            if (plan) {
                              handleSubscribe(plan.name, plan.price);
                            }
                          }}
                        >
                          {selectedPlan ? 'Confirm Subscription' : 'Select a plan to continue'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show message if earned amount is less than £20 */}
              {stats.cashEarned < 20 && (
                <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-[#f0fdf4] dark:bg-inherit">
                  <p className="text-sm text-muted-foreground">
                    Earn £{(20 - stats.cashEarned).toFixed(2)} more to unlock Standard Monthly subscription!
                  </p>
                </div>
              )}

              {/* Invitation Link */}
              <div className="space-y-2 mt-4">
                <label className="text-sm text-muted-foreground">
                  Share your referral link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-muted focus:outline-none focus:border-borderColorPrimary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="flex justify-center gap-2 pt-4">
                {platforms.map(({ name, url, Icon }) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() =>
                      window.open(url + encodeURIComponent(referralLink))
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add the confirmation modal */}
      {selectedPlan && (
        <SubscriptionConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          planName={selectedPlan}
          planPrice={eligiblePlans.find(p => p.name === selectedPlan)?.price || 0}
          currentBalance={stats.cashEarned}
          onConfirm={() => {
            // // console.log(`Subscription confirmed for ${selectedPlan}`);
            toast.success(`You've subscribed to Alle-AI ${selectedPlan}`);
            onClose();
          }}
        />
      )}
    </>
  );
}

export function SubscriptionConfirmModal({
  isOpen,
  onClose,
  planName,
  planPrice,
  currentBalance,
  onConfirm,
}: SubscriptionConfirmModalProps) {
  const remainingBalance = currentBalance - planPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Confirm Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              You&apos;re about to subscribe to
            </p>
            <p className="text-lg font-semibold">Alle-AI {planName}</p>
          </div>

          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Balance</span>
              <span className="font-medium">£{currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-infoColorPrimary">
              <span className="text-sm">Subscription Cost</span>
              <span className="font-medium">-£{planPrice.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm">Remaining Balance</span>
              <span className="font-medium">£{remainingBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-infoColorPrimary/50 bg-infoColorPrimary/5 p-4">
            <p className="text-xs text-center text-infoColorPrimary">
              <Info className="h-3 w-3 text-infoColorPrimary inline-flex" />
              This action cannot be undone. Your subscription will start immediately.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Proceed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

  export function PlansModal({ isOpen, onClose }: ModalProps) {
    const [isYearly, setIsYearly] = useState(false);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    const [showOrgPlans, setShowOrgPlans] = useState(false);
    const [teamSize, setTeamSize] = useState(50);
    const router = useRouter();
    const userPlan = useAuthStore((state) => state.plan);

    const handleProPlan = async () => {
      const planName = 'pro';
      setProcessingPlan('Pro');
      try {
        const response = await authApi.checkout({
          plan: planName,
          billing_cycle: isYearly ? 'yearly' : 'monthly',
        });

        if (response.status && response.to) {
          // Pro is a paid plan; send to checkout URL
          router.push(response.to);
          setProcessingPlan(null);
        } else {
          toast.error(response.message || 'Checkout failed');
        }
      } catch (error: any) {
        setProcessingPlan(null);
        toast.error(`${error.message || 'An error occurred. Please try again.'}`);
        
      }
    };


    const handleContactSales = () => {
      toast.message('Contact Sales', {
        description: 'Our team will reach out to you shortly!',
      })
    };

    const calculatePrice = (basePrice: number) => {
      const pricePerUser = basePrice;
      const total = Math.round((teamSize * pricePerUser) / 10) * 10;
      return isYearly ? total * 10 : total;
    };

    const handleCheckout = async (planName: string) => {
      if (planName.toLowerCase() === 'pro') {
        handleProPlan();
        return;
      }

      setProcessingPlan(planName);

      try {
        const response = await authApi.checkout({
          plan: planName.toLowerCase() as 'free' | 'standard' | 'plus' | 'custom' | 'pro',
          billing_cycle: isYearly ? 'yearly' : 'monthly',
        });

        if (response.status && response.to) {
          if (planName.toLowerCase() === 'free') {
            router.push(response.to);
          } else {
            window.location.href = response.to;
          }
          setProcessingPlan(null);

        } else {
          setProcessingPlan(null);
          throw new Error(response.message || 'Checkout failed');
        }
      } catch (error: any) {
        toast.error(`${error.message || "An error occurred. Please try again."}`)
        setProcessingPlan(null);
      }
    };

    const isCurrentPlan = (planName: string) => {
      if (!userPlan) return false;
      
      const normalizedUserPlan = userPlan.toLowerCase();
      const normalizedPlanName = planName.toLowerCase();
      
      if (normalizedPlanName === 'free') {
        return normalizedUserPlan === 'free';
      }
      
      return normalizedUserPlan === `${normalizedPlanName}-${isYearly ? 'yearly' : 'monthly'}`;
    };

    const getButtonText = (planName: string) => {
      if (isCurrentPlan(planName)) {
        return "Your Current Plan";
      }
      return planName === "Custom" ? "Customize your Plan" : `Upgrade to ${planName}`;
    };

    const plans = [
      {
        name: "Free",
        price: 0,
        description:
          "For small teams or individuals optimizing basic web queries.",
        about:
          "Interact with up to 2 AI models in a single conversation to gain diverse insights and perspectives.",
        features: [
          "Text",
          "Image",
          "2 AI Models/conversation",
          "Limited model Usage",
        ],
        buttonText: "Upgrade to Free",
        highlighted: false,
      },
      {
        name: "Standard",
        price: isYearly ? 200 : 20,
        description: "Enhanced AI capabilities and additional features.",
        about:
          "Interact with up to 3 AI models per conversation for even more diverse insights, plus access to Fact-checking, Audio, and Video generation models.",
        features: [
          "Everything in Free",
          "Up to 3 AI models",
          "Fact-checking",
          "Audio",
          "Video",
        ],
        buttonText: "Upgrade to Standard",
        highlighted: false,
      },
      {
        name: "Plus",
        price: isYearly ? 300 : 30,
        description: "Advanced AI interactions, and comprehensive flexibility.",
        about:
          "Access up to 5 AI models per conversation, with unlimited tokens and the ability to use all available AI models for maximum flexibility.",
        features: [
          "Everything in Standard",
          "Up to 5 AI models",
          "Access all AI models",
          "Early access to new features",
        ],
        buttonText: "Upgrade to Plus",
        highlighted: true,
      },
      {
        name: "Pro",
        price: isYearly ? 1600 : 160,
        description: "Everything in Plus with full flexibility to use any feature without limits.",
        about:
            "Our most capable plan with maximum flexibility and priority access.",
        features: [
          "Everything in Plus",
          "Max usage limits",
          "Dedicated Team support",
          "17% yearly discount",
        ],
        buttonText: "Upgrade to Pro",
        highlighted: false,
      },
    ];

    const orgPlans = [
      {
        name: "Business",
        basePrice: 20,
        description: "Perfect for growing organizations that need powerful AI capabilities.",
        features: [
          "Unlimited AI conversations",
          `Up to ${teamSize} team members`,
          "Advanced analytics dashboard",
          "Priority support",
          "Custom AI model integration",
          "Team collaboration features",
        ],
        icon: <Building2 className="w-5 h-5 text-primary" />,
        highlighted: false,
      },
      {
        name: "Enterprise",
        description: "Fully customizable solution with advanced security and control.",
        features: [
          "Everything in Business",
          "Unlimited team members",
          "Custom AI model training",
          "24/7 dedicated support",
          "SSO & advanced security",
          "API access",
        ],
        icon: <Shield className="w-5 h-5 text-primary" />,
        highlighted: true,
        custom: true,
      }
    ];

    return (
      <div className="overflow-auto">
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[80%] lg:max-w-[70%] overflow-y-auto max-h-[90vh]">
            {showOrgPlans ? (
              <>
                <DialogHeader className="text-center space-y-4 relative">
                  <Button
                    variant="ghost"
                    className="absolute left-0 top-0 text-sm"
                    onClick={() => setShowOrgPlans(false)}
                  >
                    ← Back
                  </Button>
                  <DialogTitle className="text-xl pt-6 text-center">Organization Plans</DialogTitle>

                  <div className="flex items-center justify-center gap-4">
                    <motion.span 
                      className={cn(
                        "text-sm font-medium transition-all duration-300",
                        !isYearly 
                          ? "text-primary scale-110 font-semibold" 
                          : "text-muted-foreground scale-100"
                      )}
                      animate={{
                        scale: !isYearly ? 1.1 : 1,
                        opacity: !isYearly ? 1 : 0.6
                      }}
                      transition={{ duration: 0.1 }}
                    >
                      Monthly
                    </motion.span>
                    <Switch
                      checked={isYearly}
                      onCheckedChange={setIsYearly}
                      className="data-[state=checked]:bg-primary"
                    />
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className={cn(
                          "text-sm font-medium transition-all duration-300",
                          isYearly 
                            ? "text-primary scale-110 font-semibold" 
                            : "text-muted-foreground scale-100"
                        )}
                        animate={{
                          scale: isYearly ? 1.1 : 1,
                          opacity: isYearly ? 1 : 0.6
                        }}
                        transition={{ duration: 0.1 }}
                      >
                        Yearly
                      </motion.span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        17% discount
                      </Badge>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto space-y-4 bg-secondary/20 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Team Size</span>
                      </div>
                      <span className="text-sm font-bold">{teamSize} users</span>
                    </div>
                    <Slider
                      value={[teamSize]}
                      onValueChange={(value) => setTeamSize(value[0])}
                      min={10}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-1 mx-auto sm:grid-cols-2 gap-4 mt-6">
                  {orgPlans.map((plan) => (
                    <motion.div
                      key={plan.name}
                      layout
                      className={cn(
                        "relative p-6 rounded-lg border max-w-md",
                        plan.highlighted
                          ? "relative p-6 rounded-xl overflow-hidden bg-gradient-to-r from-black via-neutral-900 to-black bg-[length:200%_200%] animate-black text-white"
                          : "border-borderColorPrimary"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {plan.icon}
                          <h3 className="font-medium">{plan.name}</h3>
                        </div>

                        {!plan.custom && plan.basePrice !== undefined && (
                          <motion.div
                            key={`${plan.name}-${isYearly ? "yearly" : "monthly"}-${teamSize}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-end gap-1"
                          >
                            <span className="text-2xl font-bold">
                              £{calculatePrice(plan.basePrice).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-muted-foreground mb-1 text-sm">
                              /{isYearly ? "year" : "month"}
                            </span>
                          </motion.div>
                        )}

                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>

                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm">
                              <Check className={cn(
                                "h-4 w-4",
                                plan.highlighted ? "text-primary" : "text-primary"
                              )} />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={cn(
                            "w-full",
                            plan.highlighted
                              ? "bg-primary hover:bg-primary/90"
                              : ""
                          )}
                          variant={plan.highlighted ? "default" : "outline"}
                          onClick={plan.custom ? handleContactSales : undefined}
                        >
                          {plan.custom ? "Contact Sales" : "Get Started"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-6 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-full">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Need a custom solution?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contact our sales team for custom pricing and requirements.
                  </p>
                </div>
              </>
            ) : (
              <>
                <DialogHeader className="text-center space-y-4 relative">
                  <DialogTitle className="text-xl text-center">Upgrade your plan</DialogTitle>

                  <div className="flex items-center justify-center gap-4">
                    <span className={cn("text-sm", !isYearly && "text-primary")}>
                      Monthly
                    </span>
                    <Switch
                      checked={isYearly}
                      onCheckedChange={setIsYearly}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary"
                    />
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm", isYearly && "text-primary")}>
                        Yearly
                      </span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        17% discount
                      </Badge>
                    </div>
                  </div>
                  <kbd className="absolute right-5 -top-[1.6rem] pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">esc</span>
                  </kbd>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.name}
                      layout
                      className={cn(
                        "relative p-6 rounded-lg border",
                        plan.highlighted
                          ? "relative p-6 rounded-xl overflow-hidden bg-gradient-to-r from-black via-neutral-900 to-black bg-[length:200%_200%] animate-black text-white"
                          : "border-borderColorPrimary"
                      )}
                    >
                      <div className="relative space-y-4 min-h-[25rem]">
                        <div>
                          <h3 className={cn(
                            "text-xl sm:text-2xl font-semibold",
                            plan.name === "Free" && "text-foreground",
                            plan.name === "Standard" && "bg-gradient-to-r from-gray-300 via-gray-500 to-gray-200 dark:from-gray-100 dark:via-gray-400 dark:to-gray-200 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                            plan.name === "Plus" && "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                            plan.name === "Pro" && "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                          )}>{plan.name}</h3>
                          <motion.div
                            key={`${plan.name}-${isYearly ? "yearly" : "monthly"}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-end gap-1"
                          >
                            <span className="text-3xl font-bold">
                              £
                              {typeof plan.price === "number" ? plan.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : plan.price}
                            </span>
                            /{isYearly ? <span className="font-bold">year</span> : <span className="font-bold">month</span>}
                          </motion.div>
                        </div>

                        <div
                          className={`text-sm text-muted-foreground pb-4 flex flex-col`}
                        >
                          {plan.description}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info
                                  className={`h-3 w-3 cursor-pointer right-0 ${
                                    plan.highlighted
                                      ? "text-[#fafafa]"
                                      : "text-bodyColor"
                                  }`}
                                />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-sm bg-backgroundSecondary">
                                {plan.about}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <ul className="space-y-4">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-[0.8rem]"
                            >
                              <Check
                                className={`h-4 w-4 text-primary ${
                                  plan.highlighted ? "text-[#fafafa]" : ""
                                }`}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full absolute bottom-0 ${
                            plan.highlighted
                              ? "bg-[#fafafa] text-[#171717] hover:bg-[#F8F8F8]"
                              : ""
                          }`}
                          variant={plan.highlighted ? "default" : "outline"}
                          onClick={() => 
                            plan.name.toLowerCase() === 'pro' 
                              ? handleProPlan() 
                              : handleCheckout(plan.name)
                          }
                          disabled={processingPlan !== null || isCurrentPlan(plan.name)}
                        >
                          {processingPlan === plan.name ? (
                            <div className="flex items-center gap-2">
                              <Loader className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            // getButtonText(plan.name)
                            plan.name === "Custom" ? (
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{ 
                                  repeat: Infinity,
                                  duration: 2,
                                  ease: "easeInOut"
                                }}
                                className="text-xs sm:text-sm"
                              >
                                {getButtonText(plan.name)}
                              </motion.div>
                            ) : (
                              getButtonText(plan.name)
                            )
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Custom Plans CTA */}
                <div className="mt-8">
                  <div className="rounded-xl border border-borderColorPrimary p-6 bg-backgroundSecondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">Need specific features?</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build a custom plan by selecting just the capabilities you need. Perfect for specialized workflows.
                      </p>
                    </div>
                    <Button onClick={() => router.push('/plans/custom')} variant="outline" className="shrink-0 dark:bg-white dark:hover:bg-white dark:text-black dark:hover:text-black hover:bg-black hover:text-white bg-black text-white">
                      Customize Your Plan
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-6 text-sm text-muted-foreground">
                  Need more Capabilities?{" "}
                  <button 
                    // onClick={() => setShowOrgPlans(true)}
                    className="text-primary hover:underline"
                  >
                    See Alle-AI Team & Enterprise plans
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

export function DataExportModal({ isOpen, onClose }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request data export - are you sure?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Your account details and chats will be included in the export.</li>
            <li>The data will be sent to your registered email in a downloadable file.</li>
            <li>The download link will expire 24 hours after you receive it.</li>
            <li>Processing may take some time. You&apos;ll be notified when it&apos;s ready.</li>
          </ul>
          <p className="text-sm">
            To proceed, click &quot;Confirm export&quot; below.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle export logic here
                onClose();
              }}
            >
              Confirm export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteAccountModal({ isOpen, onClose }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between relative">
          <DialogTitle>Delete account - are you sure?</DialogTitle>
          <kbd className="absolute right-4 -top-4 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">esc</span>
          </kbd>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Deleting your account is permanent and cannot be undone.</li>
            <li>
              You cannot create a new account using the same email address.
            </li>
            <li>
              Your data will be deleted within 30 days, except we may retain a
              limited set of data for longer where required or permitted by law.
            </li>
            <li>
              Read our{" "}
              <a href="#" className="text-primary hover:underline">
                help center article
              </a>{" "}
              for more information.
            </li>
          </ul>

          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            You may only delete your account if you have logged in within the
            last 10 minutes. Please log in again, then return here to continue.
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                // Handle refresh login logic
                // // console.log("Refreshing login...");
              }}
            >
              Login & Delete Forever
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LogoutAllDevicesModal({ isOpen, onClose }: ModalProps) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      onClose();
    } catch (error) {
      // console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between relative">
          <DialogTitle>Log out of all devices - are you sure?</DialogTitle>
          <kbd className="absolute right-4 -top-4 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">esc</span>
          </kbd>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>You will be logged out of all devices.</li>
            <li>All active sessions will be terminated immediately.</li>
            <li>You&apos;ll need to log in again on other devices to regain access.</li>
            <li>This action cannot be undone.</li>
          </ul>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              Confirm logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SearchHistoryModal({ isOpen, onClose, currentType }: SearchHistoryModalProps) {
  const { getHistoryByType, removeHistory: removeItem, renameHistory: renameItem } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "az" | "za">("recent");
  const router = useRouter();
  const { setGenerationType } = useConversationStore();
  const { setCurrentConversationLink, setSectionId } = useSidebarStore();

  const formatTimeDistance = (item: HistoryItem) => {
    try {
      const date = new Date(item.created_at);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (error) {
      // console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get history for current type and filter based on search
  const filteredHistory = getHistoryByType(currentType)
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      try {
        switch (sortBy) {
          case "oldest":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case "recent":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "az":
            return a.title.localeCompare(b.title);
          case "za":
            return b.title.localeCompare(a.title);
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      } catch (error) {
        // console.error('Error sorting history:', error);
        return 0;
      }
    });

  const handleHistoryItemClick = async (item: HistoryItem) => {
    // First close the modal
    onClose();
    
    // Then update the stores
    setGenerationType('load');
    setCurrentConversationLink(null);
    setSectionId(`${currentType}Id`, item.id);
    
    // Finally handle navigation after a small delay to ensure modal is closed
    setTimeout(() => {
      router.push(`/${currentType}/res/${item.session}`);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-2xl overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search History</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border-none">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <CommandInput
              placeholder={`Search ${currentType} history...`}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Tip:</span> Search by title or date
            </div>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="az">A to Z</SelectItem>
                  <SelectItem value="za">Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CommandList className="max-h-[400px] overflow-y-auto p-2">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Recent History">
              {filteredHistory.map((item) => (
                <CommandItem 
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-accent rounded-md"
                  onSelect={() => handleHistoryItemClick(item)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <History className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-small sm:text-sm sm:font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {/* {formatTimeDistance(item)} */}
                        created at {format(new Date(item.created_at), "dd'/'MM'/'yy h:mm a", { locale: enUS })}{" "}
                        {/* updated at {format(new Date(item.updated_at), "dd'/'MM'/'yy h:mm a", { locale: enUS })} */}
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => renameItem(item.id, item.title)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div> */}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function ShareDialog({ isOpen, onClose, imageUrl, modelName, showPreview = false }: ShareDialogProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const generateShareText = (imageUrl: string): string => {
    return `This awesome image was generated on the Alle-AI platform: ${imageUrl}`;
  };

  const handleShare = (platform: typeof socialMediaOptions[0]) => {
    const shareText = generateShareText(imageUrl);

    window.open(platform.handler(shareText), '_blank');
    toast.success(`Shared to ${platform.name}`);
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              Share your creation
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Share your generated masterpiece with the world
            </p>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          {showPreview && (
            <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border shadow-lg">
              <Image
                src={imageUrl}
                alt="Share preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3">
            {socialMediaOptions.map((platform) => (
              <motion.button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className={cn(
                  "group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "hover:shadow-md hover:border-primary/20",
                  dark ? "hover:bg-primary/5" : "hover:bg-primary/5"
                )}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <div className={cn(
                  "p-2 rounded-full transition-colors duration-200 bg-primary/10"
                )}>
                  <Image
                    src={platform.name === "X" ? (dark ? "/svgs/x_white.webp" : "/svgs/x_black.webp") : platform.icon}
                    alt={platform.name}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{platform.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Share to {platform.name}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t bg-muted/50">
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
            <Info className="h-3 w-3" />
            Your share helps spread the magic of AI creativity
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VideoSettingsInfoModal({ isOpen, onClose, settingType }: { isOpen: boolean; onClose: () => void; settingType: 'aspectRatio' | 'quality' | 'duration' | 'display' }) {
  const settingsInfo = {
    aspectRatio: {
      title: "Aspect Ratio",
      description: "The aspect ratio determines the shape and dimensions of your video.",
      details: [
        { label: "16:9", description: "Landscape format, ideal for YouTube, presentations" },
        { label: "1:1", description: "Square format, perfect for Instagram posts" },
        { label: "9:16", description: "Portrait format, best for TikTok, Instagram Stories" }
      ]
    },
    quality: {
      title: "Video Quality",
      description: "Higher quality means better visual detail but larger file sizes.",
      details: [
        { label: "480p", description: "SD quality, faster generation, smaller file size" },
        { label: "720p", description: "HD quality, balanced performance" },
        { label: "1080p", description: "Full HD quality, best visual detail" }
      ]
    },
    duration: {
      title: "Video Duration",
      description: "Choose how long your generated video will be.",
      details: [
        { label: "Short (5-15s)", description: "Perfect for social media clips" },
        { label: "Medium (30s)", description: "Ideal for detailed concepts" },
        { label: "Long (60s+)", description: "Best for comprehensive content" }
      ]
    },
    display: {
      title: "Display Layout",
      description: "Choose how your generated videos are displayed.",
      details: [
        { label: "Column", description: "Vertical scrolling, one video at a time" },
        { label: "Grid", description: "2x2 layout, view multiple videos at once" },
        { label: "Carousel", description: "Horizontal sliding, focused viewing" }
      ]
    }
  };

  const currentSetting = settingsInfo[settingType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {currentSetting.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {currentSetting.description}
          </p>
          <div className="space-y-4">
            {currentSetting.details.map((detail, index) => (
              <div key={index} className="flex flex-col gap-1">
                <h4 className="text-sm font-medium">{detail.label}</h4>
                <p className="text-sm text-muted-foreground">{detail.description}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AlbumModal({ isOpen, onClose }: ModalProps) {
  const [filter, setFilter] = useState<"all" | "image" | "video" | "audio">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<LikedMediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unlikeLoading, setUnlikeLoading] = useState(false);
  const { likedMedia, getLikedMediaByType, removeLikedMedia, addLikedMedia } =
    useLikedMediaStore();

  // Audio state management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch liked media when component mounts
  useEffect(() => {
    const fetchLikedMedia = async () => {
      // Only fetch if modal is open and we don't already have items in the store
      if (isOpen && likedMedia.length === 0) {
        setIsLoading(true);
        try {
          const response = await likedApi.getLikedResponses();
          // console.log('Liked media response:', response);

          // Process the response and add items to the store
          if (response.data && Array.isArray(response.data)) {
            setIsLoading(false)
            response.data.forEach((item) => {
              // Map the API response to our store format
              addLikedMedia({
                type: item.type as "image" | "video" | "audio",
                responseId: item.id.toString(),
                url: item.body,
                modelName: item.model.name,
                modelIcon: item.model.image,
                modelId: item.model.uid,
                prompt: "", // The API doesn't seem to return the prompt
                liked: true,
              });
            });
          }
        } catch (error) {
          // console.error("Error fetching liked media:", error);
          toast.error("Ooops, something went wrong!", {
            description: "Please try again",
          });
          setIsLoading(false);
        }
      }
    };

    fetchLikedMedia();
  }, [isOpen]);

  // Audio control handlers
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Reset audio state when closing preview
  useEffect(() => {
    if (!isPreviewOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPreviewOpen]);

  const filteredMedia = useMemo(() => {
    const mediaByType = getLikedMediaByType(
      filter as "image" | "video" | "audio" | "all"
    );
    if (!searchQuery) return mediaByType;
    return mediaByType.filter(
      (item) =>
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [likedMedia, filter, searchQuery, getLikedMediaByType]);

  const handleRemoveLikedMedia = async (id: string) => {
    try {
      // Find the item in the store
      const item = likedMedia.find((media) => media.id === id);

      if (!item) {
        console.error("Item not found in liked media store");
        return;
      }

      setUnlikeLoading(true);

      // console.log(item.responseId, 'this is the item id');
      // Make API call to update like state to 'none' (unlike)
      const response = await chatApi.updateLikeState(item.responseId, "none");
      // console.log(response, 'This is the response ddd')

      if (response.status) {
        // If API call is successful, remove from store
        removeLikedMedia(id);
        toast.success(`${item.modelName} ${item.type} unliked`);
      } else {
        toast.error("Failed to unlike item");
      }
    } catch (error) {
      console.error("Error unliking item:", error);
      toast.error("Failed to unlike item");
    } finally {
      setUnlikeLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95%] md:max-w-5xl h-[80vh]">
        <DialogHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <DialogTitle className="text-lg font-semibold">Album</DialogTitle>

            {/* Controls Container - properly spaced from close button */}
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4 md:pr-8">
              {/* Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by model"
                  className="pl-8 border-borderColorPrimary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Tabs */}
              <Tabs
                value={filter}
                onValueChange={(value: string) =>
                  setFilter(value as "all" | "image" | "video" | "audio")
                }
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-none md:flex">
                  <TabsTrigger value="all" className="text-xs md:text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="data-[state=active]:bg-purple-500/30 text-xs md:text-sm text-foreground"
                  >
                    Images
                  </TabsTrigger>
                  <TabsTrigger
                    value="audio"
                    className="data-[state=active]:bg-blue-500/30 text-xs md:text-sm text-foreground"
                  >
                    Audio
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="data-[state=active]:bg-yellow-500/30 text-xs md:text-sm text-foreground"
                  >
                    Videos
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className={`h-[calc(80vh-12rem)] sm:h-[calc(80vh-6rem)]`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-primary" />
                {/* <p className="text-sm text-muted-foreground">Loading your liked media...</p> */}
              </div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Heart className="h-12 w-12 mb-4" />
              <p>No {filter === "all" ? "media" : filter + "s"} found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg overflow-hidden"
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full aspect-video object-cover"
                      muted
                      loop
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                  ) : item.type === "image" ? (
                    <Image
                      src={item.url}
                      alt={item.prompt}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    // Audio preview card
                    <div className="w-full aspect-square bg-accent/10 flex flex-col items-center justify-center p-4">
                      <Music className="h-12 w-12 mb-4 text-muted-foreground" />
                      <p className="text-sm text-center line-clamp-2">
                        {item.prompt.length > 15
                          ? item.prompt.substring(0, 15) + "..."
                          : item.prompt}
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm mb-2 line-clamp-2">
                        {item.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.modelIcon}
                            alt={item.modelName || ""}
                            width={16}
                            height={16}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-white/80 text-xs">
                            {item.modelName}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                            onClick={() => handleRemoveLikedMedia(item.id)}
                            disabled={unlikeLoading}
                          >
                            {unlikeLoading ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Maximize2 className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>

      {/* Preview Modal */}
      {selectedItem && (
        <Dialog
          open={isPreviewOpen}
          onOpenChange={() => setIsPreviewOpen(false)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <div className="aspect-video relative rounded-lg overflow-hidden">
              {selectedItem.type === "video" ? (
                <video
                  src={selectedItem.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                />
              ) : selectedItem.type === "image" ? (
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.prompt}
                  fill
                  className="object-contain rounded-lg"
                />
              ) : (
                // Enhanced audio player preview
                <div className="w-full h-full flex flex-col items-center justify-center bg-accent/10 p-8">
                  <Music className="h-24 w-24 mb-8 text-muted-foreground" />
                  <div className="w-full max-w-md space-y-4">
                    {/* Audio Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Time and Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        onValueChange={(value) => handleSliderChange(value)}
                        className="w-full"
                      />
                    </div>

                    <audio
                      ref={audioRef}
                      src={selectedItem.url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {selectedItem.prompt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src={selectedItem.modelIcon}
                    alt={selectedItem.modelName || ""}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{selectedItem.modelName}</span>
                </div>
                {/* <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(selectedItem.timestamp, { addSuffix: true, locale: enUS })}
                </span> */}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

export function GoogleDriveModal({ isOpen, onClose, onFileSelect }: GoogleDriveModalProps) {
  const { isAuthenticated, checkAndRefreshAuth } = useDriveAuthStore();
  const [pathHistory, setPathHistory] = useState<Array<{ name: string; id: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  ;
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
      return;
    }

    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchQuery, files]);

  const loadFolderContents = async (folderId: string) => {
    setLoading(true);
    try {
      const gapi = driveService.getGapi();
      if (!gapi) {
        throw new Error('Google Drive API not initialized');
      }

      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, thumbnailLink)',
        orderBy: 'folder,name'
      });

      const driveFiles: DriveFile[] = response.result.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: file.mimeType,
        size: file.size,
        thumbnailUrl: file.thumbnailLink
      }));

      setFiles(driveFiles);
      setFilteredFiles(driveFiles);
      setLastRefresh(new Date());
    } catch (error) {
      // console.error('Failed to load folder contents:', error);
      toast.error('Failed to load folder contents')
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folderId: string, folderName: string) => {
    setPathHistory(prev => [...prev, { name: folderName, id: folderId }]);
    loadFolderContents(folderId);
  };

  const handleBackClick = () => {
    setPathHistory(prev => {
      const newPath = prev.slice(0, -1);
      const parentFolderId = newPath.length > 0 
        ? newPath[newPath.length - 1].id 
        : 'root';
      
      // Load the parent folder contents
      loadFolderContents(parentFolderId);
      
      return newPath;
    });
  };

  useEffect(() => {
    const initGoogleDrive = async () => {
      try {
        await driveService.init();
        const isAuthed = await checkAndRefreshAuth();
        if (isAuthed) {
          loadFolderContents('root');
        }
      } catch (error) {
        // console.error('Failed to initialize Google Drive:', error);
      }
    };

    if (isOpen) {
      initGoogleDrive();
    }
  }, [isOpen]);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const success = await driveService.signIn();
      if (success) {
        const gapi = driveService.getGapi();
        if (!gapi) {
          throw new Error('Google Drive API not initialized');
        }

        const authInstance = gapi.auth2.getAuthInstance();
        const currentUser = authInstance.currentUser.get();
        const authResponse = currentUser.getAuthResponse();
        
        useDriveAuthStore.getState().setAuth(
          authResponse.access_token,
          authResponse.expires_in
        );
        
        await loadFolderContents('root');
      }
    } catch (error) {
      // console.error('Authentication failed:', error);
      setPathHistory([]);
      setFiles([]);
      setSearchQuery('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: DriveFile) => {
    if (file.type === 'folder') {
      handleFolderClick(file.id, file.name);
      return;
    }
    
    onFileSelect(file);
    onClose();
  };

  const refreshFiles = () => {
    const currentFolderId = pathHistory.length > 0 
      ? pathHistory[pathHistory.length - 1].id 
      : 'root';
    loadFolderContents(currentFolderId);
  };

  const currentPath = pathHistory.map(p => p.name);

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Google Drive</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Image
              src="/icons/google-drive.webp"
              alt="Google Drive"
              width={64}
              height={64}
            />
            <p className="text-center text-sm text-muted-foreground">
              Connect your Google Drive to access and upload files directly from your drive.
            </p>
            <Button 
              onClick={handleAuthenticate} 
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoading ? 'Connecting...' : 'Connect Google Drive'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentPath.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackClick}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {currentPath.length === 0 ? (
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/google-drive.webp"
                    alt="Google Drive"
                    width={100}
                    height={100}
                    className="w-4 h-4"
                  />
                  Google Drive
                </div>
              ) : currentPath[currentPath.length - 1]}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshFiles}
                disabled={loading}
                className="relative focus-visible:outline-none"
                title="Refresh files"
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  loading && "animate-spin"
                )} />
              </Button>
              {lastRefresh && (
                <span className="text-xs text-muted-foreground">
                  Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-8 border-borderColorPrimary focus-visible:outline-none focus:border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-10rem)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <File className="h-12 w-12 mb-4" />
              <p>{searchQuery ? 'No matching files found' : 'No files in this folder'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-accent cursor-pointer"
                >
                  {file.type === 'folder' ? (
                    <Folder className="h-8 w-8 text-blue-500" />
                  ) : (
                    <File className="h-8 w-8 text-gray-500" />
                  )}
                  <span className="mt-2 text-sm text-center truncate w-full">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function ShareLinkModal({ isOpen, onClose }: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  ;
  const { currentConversationLink, setCurrentConversationLink } = useSidebarStore();
  const { sectionIds } = useSidebarStore();
  const { addSharedLink, updateSharedLink, getSharedLink } = useSharedLinksStore();
  const { getHistoryByType } = useHistoryStore();

  const { theme } = useTheme();
  const dark = theme === "dark";

  const generateLink = async () => {
    setIsLoading(true);


    
    // Get current history type and ID
    const currentTypeEntry = Object.entries(sectionIds).find(([_, id]) => id !== null);
    
    if (!currentTypeEntry || !currentTypeEntry[1]) {
      toast.info('Please select a conversation to share');
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const [currentType, historyId] = currentTypeEntry;
    const historyType = currentType.replace('Id', '') as 'chat' | 'image' | 'audio' | 'video';
    
    // Get the history item details
    const history = getHistoryByType(historyType).find(item => item.id === historyId);

    if (!history) {
      toast.error('Conversation not found')
      setIsLoading(false);
      return;
    }

    // Check if a link already exists for this history
    const existingLink = getSharedLink(historyId);
    
    // Generate the share link
    const baseUrl = window.location.origin;
    const newLink = `${baseUrl}/share/${historyId}`;

    if (existingLink) {
      // Update existing link
      updateSharedLink(existingLink.id, newLink);
      toast.success('Share link has been updated');
    } else {
      // Create new link
      addSharedLink(historyId, history.title, newLink);
      toast.success('Share link has been created');
    }

    setCurrentConversationLink(newLink);
    setIsNewlyCreated(true);
    setIsLoading(false);
  };

  const copyToClipboard = async () => {
    if (!currentConversationLink) return;
    
    try {
      await navigator.clipboard.writeText(currentConversationLink);
      toast.success('Copied');
    } catch (err) {
      toast.error('Failed to copy link')
    }
  };

  // Reset newly created state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsNewlyCreated(false);
    }
  }, [isOpen]);

  // Reset state when section IDs change
  useEffect(() => {
    setCurrentConversationLink(null);
    setIsNewlyCreated(false);
  }, [sectionIds]);

  const handleShare = (platform: typeof socialMediaOptions[0]) => {
    if (!currentConversationLink) return;
    window.open(platform.handler(currentConversationLink), '_blank');
  };
  
  const getButtonConfig = () => {
    if (isLoading) {
      return {
        text: "",
        icon: <Loader className="h-4 w-4 animate-spin" />,
        action: undefined
      };
    }

    // Get current history ID
    const currentTypeEntry = Object.entries(sectionIds).find(([_, id]) => id !== null);
    const historyId = currentTypeEntry?.[1];
    const existingLink = historyId ? getSharedLink(historyId) : null;

    if (!currentConversationLink) {
      return {
        text: existingLink ? "Update link" : "Create link",
        icon: <Link className="w-4 h-4" />,
        action: generateLink
      };
    }

    if (isNewlyCreated) {
      return {
        text: "Copy",
        icon: <Copy className="w-4 h-4" />,
        action: copyToClipboard
      };
    }

    return {
      text: "Update link",
      icon: <Link className="w-4 h-4" />,
      action: generateLink
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between relative">
            <DialogTitle className="text-sm">
              {currentConversationLink 
                ? 'Update sharing link' 
                : getSharedLink(Object.entries(sectionIds).find(([_, id]) => id !== null)?.[1] || '')
                  ? 'Regenerate sharing link'
                  : 'Create sharing link'
              }
              <kbd className="absolute right-4 -top-[0.6rem] pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">esc</span>
              </kbd>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isNewlyCreated 
                ? (
                  <>
                    The public link to your chat has been updated. Manage previously shared chats via {" "}
                    <span 
                  onClick={() => {
                    onClose();
                    setSettingsModalOpen(true);
                  }}
                  className="underline font-semibold cursor-pointer">Settings</span>.
                  </>
                ) : "Your name and any messages you add after sharing stay private."}
            </p>

            <div className="flex gap-2 bg-muted p-1 border border-borderColorPrimary rounded-full">
              <Input
                value={currentConversationLink || `${process.env.NEXT_PUBLIC_APP_URL}/share/...`}
                readOnly
                placeholder=""
                className="bg-muted rounded-full focus-visible:outline-none border-none"
              />
              <Button
                variant="outline"
                onClick={buttonConfig.action}
                disabled={isLoading}
                className={cn(
                  "bg-bodyColor text-xs text-bodyColorAlt shrink-0 gap-2 p-3 rounded-full border-none hover:bg-bodyColor hover:text-bodyColorAlt hover:opacity-90",
                  isLoading && "cursor-not-allowed opacity-50"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    {buttonConfig.icon}
                    {buttonConfig.text}
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {buttonConfig.text === "Update link" && (
                <>
                  A past version of this chat has already been shared. Manage previously shared chats via{" "}
                  <span 
                  onClick={() => {
                    onClose();
                    setSettingsModalOpen(true);
                  }}
                  className="underline font-semibold cursor-pointer">Settings</span>.
                </>
              )}
            </div>

            {isNewlyCreated && currentConversationLink && (
              <div className="grid grid-cols-4 gap-4">
                {socialMediaOptions.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto rounded-xl"
                    onClick={() => handleShare(platform)}
                  >
                    <Image
                      src={platform.name === "X" ? (dark ? "/svgs/x_white.webp" : "/svgs/x_black.webp") : platform.icon}
                      alt={platform.name}
                      width={20}
                      height={20}
                      className="w-4 h-4"
                    />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <SettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)}
        defaultTabValue = {'data controls'} 
      />
    </>
  );
}

export function SharedLinksModal({ isOpen, onClose }: ModalProps) {
  const { sharedLinks, removeSharedLink } = useSharedLinksStore();
  ;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLinks = useMemo(() => {
    return sharedLinks.filter(link => 
      link.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sharedLinks, searchQuery]);

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Copied');
    } catch (err) {
      toast.error('Failed to copy link');

    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between relative border-b pb-4">
          <DialogTitle>Shared Links</DialogTitle>
          <kbd className="absolute right-4 -top-4 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">esc</span>
          </kbd>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header with Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shared links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background focus-visible:outline-none focus:border-borderColorPrimary"
              />
            </div>
          </div>

          {/* Links Table */}
          <div className="rounded-md border">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr,auto] md:grid-cols-[1fr,200px,auto] gap-4 p-2 border-b bg-muted/50">
              <div className="text-sm font-medium">Name</div>
              <div className="hidden md:block text-sm font-medium">Date shared</div>
              <div className="text-sm font-medium text-right">Actions</div>
            </div>

            {/* Table Body */}
            <ScrollArea className="h-[400px]">
              {filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Link className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No shared links found</p>
                </div>
              ) : (
                filteredLinks.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr,auto] md:grid-cols-[1fr,200px,auto] gap-4 p-2 border-b last:border-0 items-center hover:bg-muted/50 group"
                  >
                    {/* Link Title */}
                    <div className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 hover:underline transition-all">
                      <Link className="h-3 w-3 flex-shrink-0 text-blue-500" />
                      <span className="truncate text-xs">{item.title}</span>
                    </div>

                    {/* Date */}
                    <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                      <Clock9 className="h-3 w-3" />
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        {/* Share Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[200px] bg-backgroundSecondary">
                                {socialMediaOptions.map((platform) => (
                                  <DropdownMenuItem
                                    key={platform.name}
                                    onClick={() => window.open(platform.handler(item.link), '_blank')}
                                    className="flex items-center gap-2"
                                  >
                                    <Image
                                      src={platform.icon}
                                      alt={platform.name}
                                      width={16}
                                      height={16}
                                    />
                                    <span>Share on {platform.name}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipTrigger>
                          <TooltipContent>Share</TooltipContent>
                        </Tooltip>

                        {/* Copy Link Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(item.link)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy link</TooltipContent>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeSharedLink(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShortcutsModal({ isOpen, onClose }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        {/* Header */}
        <div className="border-b p-6 bg-background">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <KeyboardCommand className="h-5 w-5 text-primary" />
              </div>
              Keyboard shortcuts
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[calc(80vh-8rem)]">
          <div className="p-6 space-y-8">
            {/* Essential Shortcuts */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Essential Commands</h3>
              <div className="grid gap-3">
                {shortcuts.slice(0, 4).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        {getIconForAction(item.action)}
                      </div>
                      <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                        {item.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.shortcut.map((combo, comboIndex) => (
                        <div key={comboIndex} className="flex items-center gap-1">
                          {combo.keys.map((key, keyIndex) => (
                            <kbd
                              key={keyIndex}
                              className="px-2 py-1.5 text-[10px] font-medium bg-muted rounded-md border shadow-sm min-w-[28px] flex items-center justify-center uppercase"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Shortcuts */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Shortcuts</h3>
              <div className="grid gap-3">
                {shortcuts.slice(4).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        {getIconForAction(item.action)}
                      </div>
                      <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                        {item.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.shortcut.map((combo, comboIndex) => (
                        <div key={comboIndex} className="flex items-center gap-1">
                          {combo.keys.map((key, keyIndex) => (
                            <kbd
                              key={keyIndex}
                              className="px-2 py-1.5 text-[10px] font-medium bg-muted rounded-md border shadow-sm min-w-[28px] flex items-center justify-center uppercase"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 bg-background">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-3 w-3" />
              Press <kbd className="px-2 py-1 text-[10px] font-medium bg-muted rounded-md border shadow-sm">Ctrl</kbd> + <kbd className="px-2 py-1 text-[10px] font-medium bg-muted rounded-md border shadow-sm">/</kbd> anytime to view shortcuts
            </p>
            <Button variant="outline" size="sm" className="text-xs focus-visible:outline-none" onClick={onClose}>
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function getIconForAction(action: string) {
  switch (action) {
    case "Start new conversation":
      return <MessageSquare className="h-4 w-4" />;
    case "Focus chat input":
      return <Type className="h-4 w-4" />;
    case "Copy last code block":
      return <Code className="h-4 w-4" />;
    case "Copy last response":
      return <Copy className="h-4 w-4" />;
    case "Set custom instructions":
      return <Settings className="h-4 w-4" />;
    case "Toggle sidebar":
      return <PanelLeftClose className="h-4 w-4" />;
    case "Delete chat":
      return <Trash2 className="h-4 w-4" />;
    case "Show shortcuts":
      return <KeyboardCommand className="h-4 w-4" />;
    default:
      return <KeyboardCommand className="h-4 w-4" />;
  }
}

export function ReportContentModal({ 
  isOpen, 
  onClose, 
  contentId,
  contentType,
  contentPreview 
}: ReportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  ;

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.info('Please select a category')
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for helping keep our platform safe.')
      onClose();
      setSelectedCategory('');
    } catch (error) {
      toast.error('Something went wrong, try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setSelectedCategory('');
      onClose();
      }}>
      <DialogContent className="sm:max-w-[500px] p-0 h-[calc(100vh-40px)] flex flex-col gap-0">
        {/* Fixed Header */}
        <div className="shrink-0 p-6 border-b bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Report Content
            </DialogTitle>
            <DialogDescription>
              Help us maintain a safe environment by reporting inappropriate or illegal content.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6 pr-4">
            {/* Content Preview */}
            {contentPreview && (
              <div className="p-3 rounded-lg bg-yellow-500/20 border border-borderColorPrimary">
                <div className="text-xs text-muted-foreground mb-2">Content being reported:</div>
                <div className="text-sm line-clamp-3">{contentPreview}</div>
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium">
                What type of violation are you reporting?
              </label>
              <RadioGroup
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="grid gap-3"
              >
                {reportCategories.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                      selectedCategory === category.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem
                      value={category.id}
                      id={category.id}
                      className="mt-1"
                    />
                    <label
                      htmlFor={category.id}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="text-sm font-medium leading-none">
                        {category.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional details <span className="text-muted-foreground">(Optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide any additional context..."
                className="min-h-[100px] resize-none border border-borderColorPrimary focus-visible:outline-none focus:border-2"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/500 characters
              </div>
            </div>

            {/* Include Content Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-content"
                checked={includeContent}
                onCheckedChange={(checked) => setIncludeContent(checked as boolean)}
              />
              <label htmlFor="include-content" className="text-sm text-muted-foreground leading-none">
                Include content in report for review
              </label>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="shrink-0 p-4 border-t bg-background">
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => {
              setSelectedCategory('');
              onClose();
              }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedCategory || isSubmitting}
              className="gap-2"
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                <Loader className="h-4 w-4 animate-spin" />
                Submitting
                </>
                ) : "Submit Report"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TransactionHistoryModal({ isOpen, onClose }: ModalProps) {


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Transaction History</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <DataTable columns={columns} data={transactions} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>
              Showing {transactions.length} transactions
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Total balance: £{transactions
                .filter(t => t.mode === 'platform')
                .reduce((acc, curr) => acc + curr.amount, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationModal({
  notification,
  open,
  onClose,
}: NotificationModalProps) {
  if (!notification) return null;

  const IconComponent = typeIcons[notification.type] || Bell;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <div className={`p-6 border-b bg-${notification.type === 'security' ? 'red' : 'primary'}/5`}>
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl bg-${notification.type === 'security' ? 'red' : 'primary'}/10`}>
                <IconComponent className={`h-6 w-6 text-${notification.type === 'security' ? 'red' : 'primary'}`} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">{notification.title}</DialogTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  {notification.priority && (
                    <Badge variant="outline" className="capitalize">
                      {notification.priority} Priority
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {notification.type}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {notification.message}
            </p>

            {notification.metadata && (
              <div className="space-y-3 pt-4 border-t">
                {notification.metadata.category && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder className="h-4 w-4" />
                    <span>Category: {notification.metadata.category}</span>
                  </div>
                )}
                {notification.metadata.tags && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-wrap gap-1">
                      {notification.metadata.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {format(notification.timestamp, '', {locale: enUS})}
            </div>
            
            {notification.actionUrl && (
              <Button onClick={() => window.location.href = notification.actionUrl!}>
                {notification.actionLabel || 'View Details'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PromptModal({
  isOpen,
  onClose,
  closeOnOutsideClick = true, // Default to true for backward compatibility
  title,
  message,
  type = 'info',
  actions,
  metadata,
  showConfetti = false,
}: PromptModalProps) {
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (showConfetti && isOpen) {
      // Trigger confetti animation here if needed
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti]);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'standard':
        return <Image className="bg-gradient-to-r from-gray-300/90 to-gray-400/90 rounded-2xl p-2" src={'/svgs/logo-desktop-mini.webp'} height={50} width={50} alt={`plus-model`} />;
      case 'plus':
        return <Image className="bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 rounded-2xl p-2" src={'/svgs/logo-desktop-mini.webp'} height={50} width={50} alt={`plus-model`} />;
      case 'upgrade':
        return <Gem className="h-12 w-12 text-purple-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-blue-500" />;
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // If open is becoming false (dialog is closing)
        if (!open) {
          // Only call onClose if closeOnOutsideClick is true
          if (closeOnOutsideClick) {
            onClose();
          }
          // Otherwise, do nothing - modal stays open
        }
      }}
    >
      <DialogContent className={`max-w-md ${!closeOnOutsideClick ? "[&>button]:hidden" : ""}`}>
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto"
          >
            {getIcon()}
          </motion.div>
          <DialogTitle className="text-center text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Message */}
          <div className="text-center text-muted-foreground">
            {message}
          </div>

          {/* Metadata Section */}
          {metadata && (
            <div className="space-y-4 rounded-lg bg-muted/50 p-4">
              {/* Friendly, informative text with inline link */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <a 
                      href={metadata.link ? metadata.link.url : '/about/alle-ai'} target="_blank"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {metadata.link ? metadata.link.text : 'Learn more'}
                      <ChevronRight className="h-3 w-3 inline-block" />
                    </a>
                    {' '}
                  </p>
                </div>

              {metadata.requiredTokens && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Required Tokens</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metadata.currentTokens}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-sm font-medium text-primary">{metadata.requiredTokens}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {actions && actions.length > 0 && (
            <div className={cn(
              "flex gap-3",
              actions.length === 1 ? "justify-center" : "justify-between"
            )}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  className={cn(
                    "flex-1 gap-2 focus-visible:outline-none",
                    action.variant === 'premium' && "text-white dark:bg-white dark:text-black bg-black "
                  )}
                >
                  {action.icon && action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Sparkles Animation */}
        {showSparkles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Sparkles className="absolute h-6 w-6 text-yellow-400 animate-bounce" />
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CreateApiKeyModal({ isOpen, onClose }: ModalProps) {
  const [keyName, setKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addKey = useApiKeyStore((state) => state.addKey);
  ;
  const { user } = useAuthStore();

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await keysApi.createApiKey({
        name: keyName.trim()
      });
      
      // Add the new key to the store
      addKey({
        id: response.id.toString(),
        name: response.name,
        key: response.key,
        workspace: "default",
        isVisible: false,
        isDisabled: false,
        createdAt: response.created_at,
        lastUsed: response.last_used_at,
        createdBy: user?.first_name,
        email: user?.email,
        cost: "$0.00"
      });

      toast.success('API Key Created')
      
      setKeyName('');
      onClose();
    } catch (error) {
      // console.error('Error creating API key:', error);
      toast.error('Failed to create key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
          Add a name to help you identify this API key. You can create up to 10 API keys.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="name"
              placeholder="e.g. Research API Key"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="focus-visible:outline-none focus:border-borderColorPrimary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateKey} disabled={isLoading || !keyName.trim()}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Create Key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditApiKeyModal({ isOpen, onClose, keyId, initialName }: ModalProps & { keyId: string; initialName: string }) {
  const [keyName, setKeyName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  ;
  const { keys, updateKeyName } = useApiKeyStore();

  const handleEditKey = async () => {
    if (!keyName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await keysApi.editApiKey({
        id: parseInt(keyId),
        name: keyName.trim()
      });
      
      // // console.log('Edit API key response:', response);
      
      if (response.status) {
        // Update the key name in the store
        updateKeyName(keyId, response.api_key.name);
        toast.success('API key name updated')
        onClose();
      }
    } catch (error) {
      // console.error('Error editing API key:', error);
      toast.error('Failed to update key name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit API Key
          </DialogTitle>
          <DialogDescription>
            Change the name of your API key
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="name"
              placeholder="e.g. Production API Key"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              maxLength={255}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Give your API key a memorable name to identify its use case
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleEditKey} 
            disabled={!keyName.trim() || isLoading || keyName === initialName}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CardPaymentMethodModalProps extends ModalProps {
  mode: 'add' | 'pay';
  onSubmit?: (cardDetails: any) => void;
  amount?: string;
}

export function CardPaymentMethodModal({ isOpen, onClose, mode = 'add', amount, onSubmit }: CardPaymentMethodModalProps) {
  const { addPaymentMethod } = usePaymentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(mode === 'add');
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
  const [cardholderName, setCardholderName] = useState('');
  const [country, setCountry] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const { balance } = useCreditsStore();
  const { user, plan } = useAuthStore();
  

  // For demo, use a fixed email (replace with real user email in production)
  const email = user?.email;

  // Card brand detection (from CardNumberElement event)
  const [cardBrand, setCardBrand] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) {
      setError('Stripe is not loaded.');
      return;
    }
    if (!cardComplete.number || !cardComplete.expiry || !cardComplete.cvc) {
      setError('Please enter complete card details.');
      return;
    }
    if (!cardholderName) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (!country) {
      setError('Please select a country or region.');
      return;
    }
    setIsLoading(true);
    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        setError('Card element not found.');
        setIsLoading(false);
        return;
      }
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: { email, name: cardholderName, address: { country } },
      });
      if (result.error) {
        setError(result.error.message || 'Payment failed.');
        setIsLoading(false);
        return;
      }
      // console.log(result, 'THIS IS THE CUSTOMER DETAILS FROM STRIPE');
      if (mode === 'add' || saveCard) {
        try {
          // Send the payment method to your backend
          const response = await paymentApi.savePaymentMethod(result.paymentMethod);
          // console.log('Backend response for saving card:', response);
          // Add to local store with the returned details
          addPaymentMethod({
            c_id: response.payment_method.id,
            type: 'card',
            lastFour: response.payment_method.last4,
            expiryDate: `${response.payment_method.exp_month}/${response.payment_method.exp_year}`,
            cardBrand: response.payment_method.brand as "other" | "visa" | "mastercard" | "amex" | undefined,
            isDefault: true
          });
        } catch (error) {
          console.error('Error saving payment method:', error);
          setError('Failed to save payment method');
          return;
        }
      }
      if (mode === 'pay' && onSubmit) {
        try {
          // Process the payment
          const response = await paymentApi.processPayment(
            result.paymentMethod,
            Number(amount),
            saveCard
          );
          // console.log('Backend response for payment:', response);

          if (response.client_secret) {
            // Handle 3D Secure authentication
            const { error, paymentIntent } = await stripe.confirmCardPayment(
              response.client_secret
            );

            // console.log(paymentIntent, 'THIS IS THE PAYMENT INTENT');

            if (paymentIntent?.status === 'succeeded') {
              // Update credits balance
              const totalCredits = (paymentIntent.amount/100) + balance
              useCreditsStore.getState().setBalance(totalCredits);
            }


            if (error) {
              toast.error('Something went wrong', {
                description: 'Failed to process payment',
              });
              // throw new Error(error.message);
            }
          // If card was saved during payment, add to local store
          }
        } catch (error) {
          // console.error('Error processing payment:', error);
          toast.error('Something went wrong', {
            description: 'Failed to process payment',
          });
          setError('Payment failed');
          return;
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Card brand icons
  const brandIcons: Record<string, string> = {
    visa: '/icons/visa.webp',
    mastercard: '/icons/mastercard.webp',
    amex: '/icons/amex.webp',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white dark:bg-zinc-900">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">
              {mode === 'add' ? 'Add payment method' : 'Pay with card'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Email
              </label>
              <Input 
                name="email"
                type="email"
                value={email}
                readOnly
                className="h-11 bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700 focus:border-transparent focus-visible:outline-none"
              />
            </div>
            {/* Card Information Section */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Card information
              </label>
              <div className="flex flex-col gap-2">
                <div className="relative flex-1">
                  <CardNumberElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#222',
                          '::placeholder': { color: '#888' },
                          fontFamily: 'inherit',
                          lineHeight: '2.6',
                        },
                        invalid: { color: '#e5424d' },
                      },
                    }}
                    className="h-11 w-full px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-zinc-900 focus:border-borderColorPrimary focus-visible:outline-none"
                    onChange={e => {
                      setCardComplete(c => ({ ...c, number: e.complete }));
                      setCardBrand(e.brand);
                      if (e.error) setError(e.error.message || '');
                      else setError(null);
                    }}
                  />
                  {/* Card brand icons */}
                  <div className="absolute right-3 top-2 flex gap-1">
                    {['visa', 'mastercard', 'amex'].map(brand => (
                      <img
                        key={brand}
                        src={brandIcons[brand]}
                        alt={brand}
                        className={`h-6 w-auto ${cardBrand === brand ? 'opacity-100' : 'opacity-50'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex w-full gap-2 justify-between">
                <div className="w-full">
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#222',
                          '::placeholder': { color: '#888' },
                          fontFamily: 'inherit',
                          lineHeight: '2.6',
                        },
                        invalid: { color: '#e5424d' },
                      },
                    }}
                    className="h-11 w-full px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-zinc-900 focus:border-borderColorPrimary focus-visible:outline-none"
                    onChange={e => {
                      setCardComplete(c => ({ ...c, expiry: e.complete }));
                      if (e.error) setError(e.error.message || '');
                      else setError(null);
                    }}
                  />
                </div>
                <div className="w-full">
                  <CardCvcElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#222',
                          '::placeholder': { color: '#888' },
                          fontFamily: 'inherit',
                          lineHeight: '2.6',
                        },
                        invalid: { color: '#e5424d' },
                      },
                    }}
                    className="h-11 w-full px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-zinc-900 focus:border-borderColorPrimary focus-visible:outline-none"
                    onChange={e => {
                      setCardComplete(c => ({ ...c, cvc: e.complete }));
                      if (e.error) setError(e.error.message || '');
                      else setError(null);
                    }}
                  />
                </div>
                </div>
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Cardholder name
              </label>
              <Input
                name="cardholderName"
                value={cardholderName}
                onChange={e => setCardholderName(e.target.value)}
                placeholder="Full name on card"
                className="h-11 bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700 focus:border-borderColorPrimary focus-visible:outline-none"
                required
              />
            </div>
            
            {/* Country Selection */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Country or region
              </label>
              <select
                className="h-11 w-full px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-zinc-900 focus:border-borderColorPrimary focus-visible:outline-none"
                value={country}
                onChange={e => setCountry(e.target.value)}
                required
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="GH">Ghana</option>
                <option value="NG">Nigeria</option>
                {/* Add more countries as needed */}
              </select>
            </div>
            {/* Save Card Option - Only show in pay mode */}
            {mode === 'pay' && (
              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="saveCard"
                  checked={saveCard}
                  onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="saveCard"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save card for future payments
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Save your card details securely to make future purchases faster
                  </p>
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading || !stripe}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                mode === 'add' ? 'Add payment method' : `Pay ${amount ? `£${amount}` : ''}`
              )}
            </Button>
            {/* Terms Text */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mode === 'add' 
                ? "Your payment information will be stored securely for future transactions."
                : "By confirming your payment, you allow Alle-AI to charge your card for this transaction."}
            </p>
          </form>
        </div>
        {/* Secure Badge */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">Secure payment</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BuyCreditsModal({ isOpen, onClose }: ModalProps) {
  const [amount, setAmount] = useState<string>('10');
  const [isPaymentOptionsOpen, setIsPaymentOptionsOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const { paymentMethods } = usePaymentStore();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { balance } = useCreditsStore();
  const stripe = useStripe();


  const handlePaymentMethodSelect = (method: 'card' | 'link' | 'revolut' | 'paypal') => {
    setIsPaymentOptionsOpen(false);
    if (method === 'card') {
      setIsCardModalOpen(true);
    }
  };

  const handlePayWithSavedCard = async () => {
    if (!selectedMethodId || !amount) return;
    
    setIsProcessing(true);
    
    if (!stripe ) {
      toast.error('Stripe is not loaded');
      return;
    }
    
    try {
      const response = await paymentApi.payWithSavedCard(selectedMethodId, Number(amount));
      // console.log('Payment processed:', response);
      if (response.success && response.client_secret){
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          response.client_secret
        );

        // console.log(paymentIntent, 'THIS IS THE PAYMENT INTENT')

        if (paymentIntent?.status === 'succeeded') {
          // Update credits balance
          const totalCredits = (paymentIntent.amount/100) + balance
          useCreditsStore.getState().setBalance(totalCredits);

          toast.success('Payment successful!');
        }
      }
      onClose();
    } catch (error) {
      // console.error('Failed:', error);
      toast.error(`Failed ${error} please try again`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted-foreground">£</span>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 focus-visible:outline-none focus-borderColorPrimary"
              />
            </div>
          </div>

          {/* Existing Payment Methods */}
          {paymentMethods.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Pay with</label>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethodId(method.c_id)}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 rounded-lg border transition-all",
                    selectedMethodId === method.c_id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {method.type === 'card' ? (
                    <>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">•••• {method.lastFour}</p>
                        <p className="text-sm text-muted-foreground">Expires {method.expiryDate}</p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="outline" className="ml-auto">Default</Badge>
                      )}
                    </>
                  ) : (
                    // Similar structure for bank/link payment method
                    <></>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Use a Different Payment Method */}
          <button
            onClick={() => {
              setIsCardModalOpen(true);
              onClose();
            }}
            className="w-full p-3 flex items-center gap-3 rounded-lg border border-dashed border-primary/50 hover:border-primary transition-all text-muted-foreground hover:text-primary"
          >
            Use different method
          </button>

          {/* Pay Button */}
          <Button 
          className="w-full"
          disabled={!selectedMethodId || isProcessing}
          onClick={handlePayWithSavedCard}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay £${amount}`
            )}
          </Button>
        </div>
      </DialogContent>
      
      <CardPaymentMethodModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        mode="pay"
        amount={amount}
        onSubmit={handlePayWithSavedCard}
      />
    </Dialog>
  );
}

export function ProjectModal({ isOpen, onClose }: ModalProps) {
  const { addProject, setCurrentProject, projects } = useProjectStore();
  const { plan } = useAuthStore();
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const descriptionMaxLength = 50;
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  useEffect(() => {
    if (plan === 'free' && projects.length >= 1) {
      setLimitError('Free users can only create one project. Please upgrade to create more projects.');
    } else {
      setLimitError(null);
    }
  }, [isOpen, plan, projects.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    if (limitError) {
      setPlansModalOpen(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the API to create the project
      const projectData = {
        name: projectName.trim(),
        description: description.trim()
      };
      
      const newProject = await projectApi.createProject(projectData);
      // console.log('Create project response:', newProject);

      if(!newProject.status) {
        toast.error(`${newProject.error}`);
        onClose();
        setIsLoading(false);
        return;
      }
      
      // Convert the backend project to the local store format and add it to store
      const localProject = addProject(newProject.data.name, newProject.data.description || "", {
        id: newProject.data.id.toString()
      });
      
      // Set as current project
      setCurrentProject(localProject);
      
      setIsLoading(false);
      setProjectName("");
      setDescription("");
      onClose();
      
      // Navigate to the new project
      if (newProject && newProject.data.id) {
        router.push(`/project/${newProject.data.id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setIsLoading(false);
    }
  };

  // Add a handler to limit the description text
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= descriptionMaxLength) {
      setDescription(value);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[500px] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                {limitError && (
                  <div className="text-sm text-orange-500">
                    {limitError}
                  </div>
                )}
                {/* Project Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Project name
                  </label>
                  <Input
                    id="project-name"
                    placeholder="E.g. Marketing Strategy"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="col-span-3 border border-borderColorPrimary focus-visible:outline-none focus:border-2"
                    autoFocus
                  />
                </div>

                {/* Project Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    id="project-description"
                    placeholder="What is this project about..."
                    value={description}
                    onChange={handleDescriptionChange}
                    className="resize-none focus-visible:outline-none"
                    rows={3}
                    maxLength={descriptionMaxLength}
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {description.length}/{descriptionMaxLength}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-md bg-muted p-3">
                  <div className="rounded-full bg-primary/10 p-1">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium">What&apos;s a project?</div>
                    <div>Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.</div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!projectName.trim() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating project...
                  </>
                ) : (
                    'Create project'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
    </>
  );
}


// Add these imports if not already present

interface ProjectModalProps extends ModalProps {
  projectName: string;
}

async function extractTextFromFile(file: File, fileExtension: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        
        // Handle different file types
        switch (file.type) {
          case 'text/plain':
            // Text files
            resolve(content as string);
            break;
            
          case 'application/pdf':
            // PDF files
            try {
              const arrayBuffer = event.target?.result as ArrayBuffer;
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              let fullText = '';
              
              // Extract text from each page
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                  .map(item => 'str' in item ? item.str : '')
                  .join(' ');
                fullText += pageText + '\n';
              }
              
              // console.log(`Extracted text from PDF ${file.name}:`, fullText);
              resolve(fullText);
            } catch (error) {
              console.error('Error processing PDF:', error);
              reject(new Error('Failed to process PDF'));
            }
            break;
            
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          case 'application/msword':
            // Word documents
            try {
              const arrayBuffer = event.target?.result as ArrayBuffer;
              const result = await mammoth.extractRawText({ arrayBuffer });
              const text = result.value;
              
              // console.log(`Extracted text from Word doc ${file.name}:`, text);
              resolve(text);
            } catch (error) {
              console.error('Error processing Word document:', error);
              reject(new Error('Failed to process Word document'));
            }
            break;
            
          default:
            reject(new Error('Unsupported file type'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Read as text for text files, as ArrayBuffer for PDFs and Word docs
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export function ProjectFilesModal({ isOpen, onClose, projectName}: ProjectModalProps) {
  const { currentProject, addProjectFile, removeProjectFile } = useProjectStore();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { plan } = useAuthStore();
  const [fileUploadLimitError, setFileUploadLimitError] = useState<string | null>(null);
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  useEffect(() => {
    if (plan === 'free' && files.length >= 1) {
      setFileUploadLimitError('Free users can only upload one file. Please upgrade plan to upload more files.');
    } else {
      setFileUploadLimitError(null);
    }
  }, [files.length]);

  useEffect(() => {
    if (currentProject) {
      setFiles(currentProject.files || []);
    }
  }, [currentProject]);

  const processFile = async (file: File) => {
    if (!currentProject?.id) return;

    if (fileUploadLimitError) {
      setPlansModalOpen(true);
      return;
    }
    
    try {
      // Validate file type
      const validTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only text, PDF, and Word documents are supported.`);
        return;
      }

      // Show processing toast
      const toastId = toast.loading(`Processing ${file.name}...`);

      // Get file extension
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')) || '';
      
      // Extract text content
      const textContent = await extractTextFromFile(file, fileExtension);
      
      // Create a file object for the backend
      const projectFile: import('@/lib/api/project').ProjectFile = {
        file_name: file.name,
        file_size: formatFileSize(file.size),
        file_type: file.type.split('/')[0], // 'text', 'application', etc.
        file_extension: fileExtension,
        file_content: textContent,
        file_url: null
      };
      
      // Validate file size
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size exceeds 100MB limit');
      }

      // First update toast to show uploading
      toast.loading(`Uploading ${file.name}...`, { id: toastId });
      
      // Call API to upload the file directly
      const newProjectFile = await projectApi.uploadProjectFiles(currentProject.id, [projectFile]);
      // console.log('New project file:', newProjectFile);

      if(!newProjectFile.status) {
        toast.error(`${newProjectFile.error}`);
        return;
      }
      
      // Now add to local storage for UI display 
      await addProjectFile(currentProject.id, file);
      
      // Update toast to show success
      toast.success(`Successfully uploaded: ${file.name}`, { id: toastId });

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    
    // Process each file sequentially
    for (const file of files) {
      await processFile(file);
    }
    
    setIsUploading(false);
  };
  const handleComputerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.pdf,.doc,.docx';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files);
      }
    };
    
    input.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!currentProject?.id) return;
    
    try {
      setIsDeleting(true);
      const toastId = toast.loading('Deleting file...');
      
      // File ID is already the correct index from API
      const fileIndex = parseInt(fileId, 10);
      // console.log('Deleting file with index:', fileIndex);
      
      // Call the API to remove the file
      await projectApi.removeProjectFiles(currentProject.id, [fileIndex]);
      
      // Remove the file from the UI
      removeProjectFile(currentProject.id, fileId);
      
      toast.success('File removed successfully', { id: toastId });
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error(`Failed to remove file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // const handleDownload = (file: ProjectFile) => {
  //   if (!file.content) {
  //     toast.error('Download failed, please try again');
  //     return;
  //   }

  //   try {
  //     const content = file.content.split(',')[1];
  //     const blob = new Blob([Buffer.from(content, 'base64')], { type: file.mimeType });
      
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = file.name;
  //     document.body.appendChild(a);
  //     a.click();
      
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     toast.error('Download failed, please try again');
  //   }
  // };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Project files</DialogTitle>
          </DialogHeader>

          {plan === 'free' && (
            <div className="text-sm text-orange-500">
              Free users can only upload one file. Please upgrade plan to upload more files.
            </div>
          )}

          {/* Drag and Drop Area */}
          <div 
            className={`flex-1 rounded-xl transition-all duration-200 ${
              isDragging 
                ? 'border border-dashed border-borderColorPrimary bg-primary/5' 
                : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl pointer-events-none z-10">
                <Upload className="h-16 w-16 text-primary mb-4" />
                <p className="font-medium text-lg">Drop files to upload</p>
              </div>
            )}

            <ScrollArea className="h-[300px] w-full">
              <div className="space-y-2">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 group hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-background">
                          <FileText style={{ color: currentProject!.color  }} className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteFile(file.id)}
                          disabled={isDeleting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px] rounded-lg bg-muted/50 border border-dashed">
                    <div onClick={handleComputerUpload} className="flex flex-col items-center justify-center p-8 text-center cursor-pointer">
                      <div className="mb-4">
                        <FilePlus2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <p>Add documents, PDFs, and text files.</p>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop files here or click Add files
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end items-center gap-2 mt-2">
              <FileUploadButton
                onUploadFromComputer={handleComputerUpload}
                onUploadFromDrive={processFile}
                buttonIcon={
                  <Button variant="default" size="sm" className="gap-1" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add files
                      </>
                    )}
                  </Button>
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
    </>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function ProjectInstructionsModal({ isOpen, onClose, projectName }: ProjectModalProps) {
  const { currentProject, updateProject } = useProjectStore();
  const [instructions, setInstructions] = useState(currentProject?.instructions || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [instructionsLimitError, setInstructionsLimitError] = useState<string | null>(null);
  const { plan } = useAuthStore();

  useEffect(() => {
    if (plan === 'free') {
      setInstructionsLimitError('Your current plan does not allow you to add custom instructions. Please upgrade plan use this feature.');
    } else {
      setInstructionsLimitError(null);
    }
  }, [isOpen, plan]);


  // Initialize instructions from currentProject when modal opens
  useEffect(() => {
    if (isOpen && currentProject) {
      setInstructions(currentProject.instructions || "");
      setError(null);
    }
  }, [isOpen, currentProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject?.id) return;

    if (instructionsLimitError) {
      setPlansModalOpen(true);
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Show loading toast
      const toastId = toast.loading("Updating project instructions...");
      
      const trimmedInstructions = instructions.trim();
      
      // Validate instructions
      if (!trimmedInstructions) {
        throw new Error("Instructions cannot be empty");
      }
      
      // Call the API endpoint to save the instructions
      const result = await projectApi.setProjectInstructions(currentProject.id, trimmedInstructions);

      if(!result.status) {
        setPlansModalOpen(true);
        toast.error(`${result.error}`);
        return;
      }
      
      // Update local state if API call is successful
      updateProject(currentProject.id, { instructions: trimmedInstructions });
      
      // Update toast
      toast.success("Instructions saved successfully", { id: toastId });
      
      setIsSaving(false);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save instructions";
      toast.error(errorMessage);
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Add instructions</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                {instructionsLimitError && (
                  <div className="text-sm text-orange-500">
                    {instructionsLimitError}
                  </div>
                )}
                <label className="text-sm font-medium">
                  Tailor the way you get response in this project
                </label>
                <Textarea
                  placeholder="E.g. You are a financial advisor helping me plan my investments..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px] resize-none focus-visible:outline-none focus:border-2"
                  disabled={isSaving}
                />
              </div>
            
              <div className="flex items-start gap-2 rounded-md bg-muted p-3">
                <div className="rounded-full bg-primary/10 p-1">
                  <LightbulbIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>These instructions will be included in every message on this platform in this project.</p>
                  <p className="mt-1">Use them to specify:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Role and tone</li>
                    <li>Background context</li>
                    <li>Preferred format</li>
                    <li>What to include or avoid</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving || !instructions.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Instructions'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
    </>
  );
}

export function OrganizationModal({ isOpen, onClose }: ModalProps) {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [orgName, setOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  ;
  const router = useRouter();

  // Mock data - Replace with your actual data fetching
  const organizations = [
    {
      id: 'org1-a1b2c3',
      name: 'KNUST',
      role: 'Admin',
      members: 300,
      image: '/icons/knust.webp'
    },
    {
      id: 'org2-d4e5f6',
      name: 'University of Ghana',
      role: 'Admin',
      members: 300,
      image: '/icons/legon.webp'
    }
  ];

  const generateOrgId = (orgName: string) => {
    const prefix = 'org';
    const counter = organizations.length + 1;
    const uniqueId = crypto.randomUUID().split('-')[0];
    return `${prefix}${counter}-${uniqueId}`;
  };


  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newOrgId = generateOrgId(orgName);
      // Add your organization creation logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Organization Created');
      
      // Open the new organization page in a new tab
      router.push(`/organization/${newOrgId}`);
      onClose();
    } catch (error) {
      toast.error('Error creating organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOrg = async (orgId: string) => {
    try {
      // Add your organization selection logic here
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API call
      router.push(`/organization/${orgId}`);
      onClose();
    } catch (error) {
      toast.error('Error, switching organization');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view === 'list' ? (
              <>
                <Building2 className="h-5 w-5" />
                Organizations
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create Organization
              </>
            )}
          </DialogTitle>
          {view === 'list' && (
            <DialogDescription>
              Select an organization to switch context or create a new one
            </DialogDescription>
          )}
        </DialogHeader>

        {view === 'list' ? (
          <>
            {/* Organizations List */}
            <div className="space-y-4">
              {organizations.map((org) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-lg border border-border hover:border-primary/50 transition-colors",
                    "cursor-pointer group relative"
                  )}
                  onClick={() => handleSelectOrg(org.id)}
                >
                  <div className="flex items-center gap-4">
                    {org.image ? (
                      <Image
                        src={org.image}
                        alt={org.name}
                        width={30}
                        height={30}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {org.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {org.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {org.members} members
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Create New Organization Button */}
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setView('create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Organization
            </Button>
          </>
        ) : (
          <>
            {/* Create Organization Form */}
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Enter organization name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <InfoIcon className="w-4 h-4 text-primary" />
                  Important Note
                </div>
                <p className="text-sm text-muted-foreground">
                  Creating an organization requires an organization plan. You&apos;ll be prompted to select a plan after creation.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView('list')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!orgName.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddMembersModal({ isOpen, onClose }: ModalProps) {
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      Papa.parse(uploadedFile, {
        header: true,
        complete: (results) => {
          const columnNames = results.meta.fields || [];
          setColumns(columnNames.filter(name => name.trim() !== '')); // Filter out empty strings
        },
        error: (error) => {
          // console.error("Error parsing file:", error);
        }
      });
    }
  };

  const handleAddEmail = () => {
    if (email && !emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter(e => e !== emailToRemove));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Add your submission logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      // console.error("Failed to add members", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailList([]);
    setFile(null);
    setColumns([]);
    setSelectedColumn('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-background rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Add Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Enter member email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-borderColorPrimary rounded-md p-2 focus:border-primary focus:ring-2 focus:ring-primary"
            />
            <Button 
              size="icon"
              variant="outline"
              onClick={handleAddEmail} 
              className="rounded-md transition">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {emailList.length > 0 && (
            <ul className="list-decimal list-inside border border-borderColorPrimary rounded-md p-2 max-h-40 overflow-y-auto">
              {emailList.map((email, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-1 px-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{index + 1}. {email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center space-x-3">
            <label className="flex items-center justify-center w-1/3 h-10 border border-dashed border-borderColorPrimary rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
              <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} className="hidden" />
              <span className="text-sm text-muted-foreground">{file ? file.name : 'Select File'}</span>
            </label>
            {columns.length > 0 && (
              <Select onValueChange={setSelectedColumn}>
                <SelectTrigger className="w-full border border-borderColorPrimary rounded-md p-2 focus:border-primary focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Select email column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-sm text-muted-foreground border border-borderColorPrimary p-2 rounded-md">You can upload a CSV or Excel file to add multiple emails at once.</p>
          <Button

            onClick={handleSubmit}
            disabled={isSubmitting || (emailList.length === 0 && (!file || !selectedColumn))}
            className="w-full py-2 rounded-md hover:bg-primary-dark transition"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface AutoFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  // onubSmit: (liked: boolean, feedback: string) => Promise<void>;
  onAskLater: () => void;
}

export function AutoFeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  onAskLater 
}: AutoFeedbackModalProps) {
  const [liked, setLiked] = useState<boolean | null | 'neutral'>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (liked === null) {
      toast.error('Please select an option about your experience');
      return;
    }

    setIsSubmitting(true);
    try {
      // await onSubmit(liked, feedback);
      // Reset form
      onSubmit();
      setLiked(null);
      setFeedback("");
      onClose();
      toast.success('Thanks for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle function that allows deselection
  const toggleLiked = (value: boolean | 'neutral') => {
    setLiked(prev => prev === value ? null : value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-5 rounded-xl"> 
        <DialogHeader>
          <DialogTitle>How&apos;s your experience so far? 🤓</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">          
          {/* Thumbs up/down/neutral selection with animation */}
          <div className="flex justify-center gap-6 py-2">
            <motion.button
              onClick={() => toggleLiked(true)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-full transition-all",
                liked === true 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                  : "hover:bg-muted"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: liked === true ? [1, 1.2, 1] : 1,
                transition: { duration: 0.3 }
              }}
            >
              <ThumbsUp size={24} className={liked === true ? "fill-green-500 dark:fill-green-400" : ""} />
            </motion.button>
            
            <motion.button
              onClick={() => toggleLiked('neutral')}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-full transition-all",
                liked === 'neutral' 
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" 
                  : "hover:bg-muted"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: liked === 'neutral' ? [1, 1.2, 1] : 1,
                transition: { duration: 0.3 }
              }}
            >
              <HelpCircle size={24} className={liked === 'neutral' ? "fill-yellow-500 dark:fill-yellow-400" : ""} />
            </motion.button>
            
            <motion.button
              onClick={() => toggleLiked(false)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-full transition-all",
                liked === false 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                  : "hover:bg-muted"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: liked === false ? [1, 1.2, 1] : 1,
                transition: { duration: 0.3 }
              }}
            >
              <ThumbsDown size={24} className={liked === false ? "fill-red-500 dark:fill-red-400" : ""} />
            </motion.button>
          </div>
          
          {/* Feedback textarea with floating label */}
          <div className="relative">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder=""
              className="w-full border-borderColorPrimary min-h-[2rem] resize-none focus-visible:outline-none"
              rows={2}
              id="feedback-input"
            />
            <label 
              htmlFor="feedback-input"
              className={cn(
                "absolute left-3 transition-all duration-200",
                feedback.length > 0 
                  ? "-top-4 text-xs text-muted-foreground" 
                  : "top-4 -translate-y-1/2 text-sm text-muted-foreground"
              )}
            >
              How&apos;s your experience so far? 
            </label>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={onAskLater}
              className="flex-1"
              size="sm"
            >
              Ask me later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || liked === null}
              className="flex-1"
              size="sm"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add the AutoReloadModal after another modal component

export function AutoReloadModal({ isOpen, onClose }: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [threshold, setThreshold] = useState<string>("10");
  const [amount, setAmount] = useState<string>("50");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const { paymentMethods } = usePaymentStore();
  const { settings: autoReloadSettings } = useAutoReloadStore();
  
  // Initialize with existing settings if available
  useEffect(() => {
    if (autoReloadSettings) {
      setThreshold(autoReloadSettings.threshold.toString());
      setAmount(autoReloadSettings.amount.toString());
      setSelectedMethodId(autoReloadSettings.payment_method_id);
      setIsEnabled(autoReloadSettings.enabled);
    } else {
      // Default values for new setup
      setThreshold("10");
      setAmount("50");
      setIsEnabled(true);
      
      // Find default payment method if available
      const defaultMethod = paymentMethods.find(method => method.isDefault);
      if (defaultMethod && !selectedMethodId) {
        setSelectedMethodId(defaultMethod.c_id);
      } else if (paymentMethods.length > 0 && !selectedMethodId) {
        setSelectedMethodId(paymentMethods[0].c_id);
      }
    }
  }, [autoReloadSettings, paymentMethods, selectedMethodId]);

  const handleSubmit = async () => {
    if (!selectedMethodId) {
      setError("Please select a payment method");
      return;
    }

    if (!threshold || isNaN(Number(threshold)) || Number(threshold) <= 0) {
      setError("Please enter a valid threshold amount");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid reload amount");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentApi.setupAutoReload(
        Number(threshold),
        Number(amount),
        selectedMethodId
      );

      if (response.success) {
        toast.success("Auto-reload set up successfully");
        onClose();
      } else {
        setError("Failed to set up auto-reload. Please try again.");
      }
    } catch (error) {
      console.error("Error setting up auto-reload:", error);
      setError("An error occurred while setting up auto-reload");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set up Auto-reload</DialogTitle>
          <DialogDescription>
            Automatically add credits when your balance falls below the threshold.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold (£)</Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="10"
              className="col-span-2 focus-visible:outline-none border-borderColorPrimary"
            />
            <p className="text-xs text-muted-foreground">
              Auto-reload triggers when your balance falls below this amount
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Reload Amount (£)</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              step="5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50"
              className="col-span-2 focus-visible:outline-none border-borderColorPrimary"
            />
            <p className="text-xs text-muted-foreground">
              Amount to add when auto-reload is triggered
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            {paymentMethods.length === 0 ? (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground">No payment methods available</p>
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto"
                  onClick={() => {
                    onClose();
                    // Ideally you would open the add payment method modal here
                  }}
                >
                  Add a payment method
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      "flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors",
                      selectedMethodId === method.c_id
                        ? "border-primary bg-primary/5"
                        : "border-input"
                    )}
                    onClick={() => setSelectedMethodId(method.c_id)}
                  >
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">•••• •••• •••• {method.lastFour}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {method.expiryDate}
                      </p>
                    </div>
                    {selectedMethodId === method.c_id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive mt-2">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || paymentMethods.length === 0}>
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Setting up..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
