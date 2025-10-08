"use client";

import { registerWidget } from "../../api/widget";
import { useStore } from "@nanostores/react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "../components/input/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import LogoButton from "../components/navbar/LogoButton";
import { Textarea } from "../components/ui/textarea";
import { $user } from "@/lib/userStore";
import { useToast } from "@/hooks/use-toast";
import { getTeams } from "@/api/teams";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RegisterWidgetDataType } from "@/data/types";

interface Team {
  team_id: string;
  team_name: string;
}

export function WidgetForm() {
  const [visibility, setVisibility] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const router = useRouter();
  const { idToken } = useAuth();
  const user = useStore($user);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error loading teams",
          description: "Could not load teams for selection",
          variant: "destructive",
        });
      }
    };

    fetchTeams();
  }, []);

  const handleTeamChange = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeams(prev => [...prev, teamId]);
    } else {
      setSelectedTeams(prev => prev.filter(id => id !== teamId));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    try {
      // if (!idToken) {
      //   throw new Error("ID Token not found. Please log in again.");
      // }

      const widgetData: RegisterWidgetDataType = {
        widgetName: data["widget-name"],
        description: data["description"],
        visibility: visibility,
      };

      await registerWidget(widgetData, parseInt(user.id));
      router.push("/dashboard"); // or wherever you want to redirect after success
    } catch (error) {
      console.error(error);
      toast({
        title: "Error registering widget",
        description: error instanceof Error ? error.message : "",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[450px] pb-5 px-5 min-h-[520px] relative">
      <CardHeader className="flex flex-col items-center justify-center">
        <div className="mb-2">
          <LogoButton width={70} height={70} />
        </div>
        <CardTitle className="text-alpbBlue">
          Get started with SLUGGER
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="widget-name">Widget Name</Label>
              <Input
                id="widget-name"
                name="widget-name"
                type="text"
                required={true}
                placeholder="Your widget name"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">A brief description</Label>
              <Textarea
                id="description"
                name="description"
                required={false}
                placeholder="A brief description"
              />
            </div>

            <Separator className="my-4" />
            <div className="flex flex-col space-y-1.5 relative z-20">
              <Select
                name="account-type"
                required={true}
                onValueChange={(vis) => setVisibility(vis)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectGroup>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {visibility === "private" && (
              <div className="flex flex-col space-y-1.5 relative z-10">
                <Label>Select teams that can access this widget</Label>
                <div className="border rounded-md p-3 h-40 overflow-y-auto space-y-2 bg-white">
                  {teams.map((team) => (
                    <div key={team.team_id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`team-${team.team_id}`}
                        checked={selectedTeams.includes(team.team_id)}
                        onCheckedChange={(checked) => handleTeamChange(team.team_id, !!checked)}
                      />
                      <Label htmlFor={`team-${team.team_id}`}>{team.team_name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <SubmitButton btnText="Sign up" className="mt-8" />
        </form>
      </CardContent>
    </Card>
  );
}
