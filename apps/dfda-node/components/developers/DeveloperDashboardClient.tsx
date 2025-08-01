'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyRequestForm } from "@/components/developers/ApiKeyRequestForm";
import OAuthApplicationForm from "@/components/developers/OAuthApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { logger } from "@/lib/logger"
import Link from "next/link"
import { ExternalLink, LayoutDashboard, SearchCode, BookText, SquareCode, BotMessageSquare, KeyRound, Pencil, Trash2, RefreshCw, Copy, CheckCircle, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeExampleTabs } from "@/components/developers/CodeExampleTabs"
import { type User } from '@supabase/supabase-js';
import { type Database } from '@/lib/database.types';
import { listOAuthClients, deleteOAuthClient, resetOAuthClientSecret, createOAuthClient, updateOAuthClient } from '@/lib/actions/developer/oauth-clients.actions';
import { CreateOAuthClientInputSchema, UpdateOAuthClientInputSchema, type CreateOAuthClientInput, type UpdateOAuthClientInput } from '@/lib/actions/developer/oauth-clients.schemas';
import { z } from 'zod';
import { updateDeveloperProfile, type UpdateProfileInput } from '@/lib/actions/developer/profile.actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useChat } from '@ai-sdk/react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useMediaQuery } from 'usehooks-ts';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';

// Derive the Profile type
type Profile = Database['public']['Tables']['profiles']['Row'];

// Use Pick from the generated DB types for OAuthClient
type OAuthClient = Pick<
  Database['public']['Tables']['oauth_clients']['Row'],
  |'client_id'
  | 'client_name'
  | 'client_uri'
  | 'redirect_uris'
  | 'logo_uri'
  | 'scope'
  | 'grant_types'
  | 'response_types'
  | 'client_type'
  | 'created_at'
  | 'owner_id'
  | 'tos_uri'
  | 'policy_uri'
>;

export interface DeveloperDashboardClientProps {
  user: User | null;
  profile: Profile | null;
}

export function DeveloperDashboardClient({ user, profile: initialProfile }: DeveloperDashboardClientProps) {
  const [oauthClients, setOAuthClients] = useState<OAuthClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<OAuthClient | null>(null);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string; clientId?: string; newSecret?: string } | null>(null);

  // Profile state
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateStatus, setProfileUpdateStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [firstName, setFirstName] = useState(initialProfile?.first_name ?? '');
  const [lastName, setLastName] = useState(initialProfile?.last_name ?? '');

  // State for OpenAPI spec for chat
  const [openApiSpecForChat, setOpenApiSpecForChat] = useState<string | null>(null);
  const [isFetchingSpec, setIsFetchingSpec] = useState(true);

  // useChat hook integration
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading: isChatLoading,
    error: chatError,
    reload,
    stop,
  } = useChat({
    api: '/api/chat',
  });

  const [openApiSpecObject, setOpenApiSpecObject] = useState<any>(null);

  const fetchOpenApiSpec = useCallback(async () => {
    try {
      const res = await fetch('/api/openapi');
      const spec = await res.json();
      setOpenApiSpecObject(spec);
      logger.info('[DeveloperDashboard] OpenAPI spec fetched for SwaggerUI.');
    } catch (err) {
      logger.error('[DeveloperDashboard] Error fetching OpenAPI spec for SwaggerUI', err);
      setOpenApiSpecObject(null);
    }
  }, []);

  const fetchAndSetSpecForChat = useCallback(async () => {
    setIsFetchingSpec(true);
    try {
      const res = await fetch('/api/openapi');
      const spec = await res.json();
      setOpenApiSpecForChat(JSON.stringify(spec, null, 2));
      logger.info('[DeveloperDashboard] OpenAPI spec fetched and processed for chat.');
    } catch (err) {
      logger.error('[DeveloperDashboard] Error fetching/processing OpenAPI spec for chat', err);
      setOpenApiSpecForChat(null);
    } finally {
      setIsFetchingSpec(false);
    }
  }, []);

  const fetchOAuthClients = useCallback(async () => {
    if (!user) return;
    setIsLoadingClients(true);
    setClientsError(null);
    try {
      const result = await listOAuthClients();
      if (result.success && result.data) {
        setOAuthClients(result.data as OAuthClient[]); 
      } else {
        setClientsError(result.error || 'Failed to load OAuth clients.');
        logger.error("Failed to fetch OAuth clients", { error: result.error, details: result.details });
      }
    } catch (e: any) {
      logger.error("Error calling listOAuthClients action", { error: e });
      setClientsError('An unexpected error occurred while fetching clients.');
    }
    setIsLoadingClients(false);
  }, [user]);

  useEffect(() => {
    fetchOAuthClients();
    fetchAndSetSpecForChat();
    fetchOpenApiSpec();
    // Update local state if initialProfile changes (e.g. after server-side update and re-render)
    setFirstName(initialProfile?.first_name ?? '');
    setLastName(initialProfile?.last_name ?? '');
  }, [fetchOAuthClients, initialProfile, fetchAndSetSpecForChat, fetchOpenApiSpec]);

  const handleCreateSubmit = async (formData: z.output<typeof CreateOAuthClientInputSchema>) => {
    setActionStatus(null);
    setIsSubmittingForm(true);
    try {
      const result = await createOAuthClient(formData);
      if (result.success && result.data) {
        setActionStatus({
          type: 'success',
          message: 'OAuth Application created successfully! Please save your client secret.',
          clientId: result.data.client_id,
          newSecret: result.data.client_secret
        });
        fetchOAuthClients();
        setIsCreateFormVisible(false);
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed to create client.' });
        logger.error('Create OAuth Client failed', { error: result.error, details: result.details });
      }
    } catch (e: any) {
      setActionStatus({ type: 'error', message: 'An unexpected error occurred during client creation.' });
      logger.error('Error calling createOAuthClient action', { error: e });
    }
    setIsSubmittingForm(false);
  };

  const handleUpdateSubmit = async (formData: z.output<typeof UpdateOAuthClientInputSchema>) => {
    if (!editingClient?.client_id) {
      setActionStatus({ type: 'error', message: 'Cannot update client: Client ID is missing.' });
      setIsSubmittingForm(false);
      return;
    }
    setActionStatus(null);
    setIsSubmittingForm(true);

    try {
      const { client_id: formClientId, ...updatePayload } = formData;

      if (formClientId !== editingClient.client_id) {
        logger.error('Client ID mismatch during update attempt.', { formClientId, editingClientId: editingClient.client_id });
        setActionStatus({ type: 'error', message: 'Client ID mismatch. Please refresh and try again.' });
        setIsSubmittingForm(false);
        return;
      }
      
      const result = await updateOAuthClient(editingClient.client_id, updatePayload);

      if (result.success) {
        setActionStatus({ type: 'success', message: 'OAuth Application updated successfully.' });
        fetchOAuthClients();
        setEditingClient(null);
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed to update client.' });
        logger.error('Update OAuth Client failed', { error: result.error, details: result.details });
      }
    } catch (e: any) {
      setActionStatus({ type: 'error', message: 'An unexpected error occurred during client update.' });
      logger.error('Error calling updateOAuthClient action', { error: e });
    }
    setIsSubmittingForm(false);
  };

  const handleEditClient = (client: OAuthClient) => {
    setActionStatus(null); 
    setIsCreateFormVisible(false);
    setEditingClient(client);
  };

  const handleCancelForm = () => {
    setIsCreateFormVisible(false);
    setEditingClient(null);
    setActionStatus(null);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    setActionStatus(null);
    if (window.confirm(`Are you sure you want to delete the OAuth client "${clientName}"? This action cannot be undone.`)) {
      const result = await deleteOAuthClient(clientId);
      if (result.success) {
        setActionStatus({ type: 'success', message: result.message || 'Client deleted successfully.' });
        fetchOAuthClients(); 
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed to delete client.' });
        logger.error('Failed to delete OAuth Client', { clientId, error: result.error, details: result.details });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setActionStatus(prev => ({ 
        type: 'success', 
        message: prev?.message + ' (Copied to clipboard!)' || 'Copied to clipboard!',
        clientId: prev?.clientId,
        newSecret: prev?.newSecret
      })); 
      setTimeout(() => setActionStatus(prev => {
        if (prev?.message.includes("(Copied to clipboard!)")){
            return {...prev, message: prev.message.replace(" (Copied to clipboard!)","")}
        }
        return prev;
      }), 2000);
    }).catch(err => {
      logger.error("Failed to copy to clipboard", { error: err });
      setActionStatus({ type: 'error', message: 'Failed to copy new secret.'});
    });
  };

  const handleResetClientSecret = async (clientId: string, clientName: string) => {
    setActionStatus(null);
    if (window.confirm(`Are you sure you want to reset the secret for "${clientName}"? The current secret will stop working immediately. This action cannot be undone.`)) {
      const result = await resetOAuthClientSecret(clientId);
      if (result.success && result.data?.client_secret) {
        setActionStatus({
          type: 'success',
          message: `Secret for "${clientName}" has been reset. Please save the new secret. It will not be shown again.`,
          clientId: clientId,
          newSecret: result.data.client_secret
        });
        fetchOAuthClients(); 
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed to reset secret.' });
        logger.error('Failed to reset client secret', { clientId, error: result.error, details: result.details });
      }
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    
    setProfileUpdateStatus(null);
    setIsUpdatingProfile(true);

    const input: UpdateProfileInput = {
        first_name: firstName,
        last_name: lastName,
    };

    const result = await updateDeveloperProfile(user.id, input);

    if (result.success) {
      setProfileUpdateStatus({ type: 'success', message: 'Profile updated successfully.' });
      setTimeout(() => setProfileUpdateStatus(null), 3000);
    } else {
      setProfileUpdateStatus({ type: 'error', message: result.error || 'Failed to update profile.' });
      logger.error('Failed to update profile', { userId: user.id, error: result.error, details: result.details });
    }
    setIsUpdatingProfile(false);
  };

  // Custom handleSubmit for chat to include OpenAPI spec
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!openApiSpecForChat && !isFetchingSpec) {
        alert("API specification is not yet loaded or failed to load. Please wait a moment or try refreshing.");
        return;
    }
    originalHandleSubmit(e, {
        data: { openApiSpec: openApiSpecForChat }
    });
  };

  // Tab definitions for unified tab management
  const tabDefinitions = [
    { value: "dashboard", title: "Dashboard", icon: LayoutDashboard },
    { value: "apiExplorer", title: "API Explorer", icon: SearchCode },
    { value: "documentation", title: "Documentation", icon: BookText },
    { value: "examples", title: "Code Examples", icon: SquareCode },
    { value: "apiChat", title: "API Chat", icon: BotMessageSquare },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabDefinitions[0].value);
  const isMobile = useMediaQuery("(max-width: 768px)"); // Tailwind's md breakpoint

  if (!user) {
    return <div>Loading user data or authentication required...</div>;
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Developer Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile, API keys, OAuth applications, and access documentation.</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {isMobile ? (
            <ExpandableTabs
              tabs={tabDefinitions.map(t => ({ title: t.title, icon: t.icon }))} // Pass only title and icon
              onChange={(index) => {
                if (index !== null && tabDefinitions[index]) {
                  setActiveTab(tabDefinitions[index].value);
                }
              }}
              className="mb-4 px-1" // Added px-1 to match original TabsList padding, and mb-4
              // Ensure activeColor matches the one used in TabsTrigger or a suitable one
              activeColor="text-foreground bg-muted"
            />
          ) : (
            <TabsList className="grid w-full grid-cols-5">
              {tabDefinitions.map(tab => {
                const IconComponent = tab.icon; // Assign the icon component to a variable
                return (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    <IconComponent className="mr-2 h-4 w-4" /> {/* Use the IconComponent */}
                    {tab.title}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          )}

          <TabsContent value="dashboard" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Keep your contact information up to date.</CardDescription>
              </CardHeader>
              <CardContent>
                {profileUpdateStatus && (
                    <Alert variant={profileUpdateStatus.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                        {profileUpdateStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        <AlertTitle>{profileUpdateStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        <AlertDescription>{profileUpdateStatus.message}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="developer-first-name">First name</Label>
                      <Input 
                        id="developer-first-name" 
                        name="developer-first-name" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        disabled={isUpdatingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="developer-last-name">Last name</Label>
                      <Input 
                        id="developer-last-name" 
                        name="developer-last-name" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developer-email">Email</Label>
                    <Input id="developer-email" name="developer-email" type="email" value={user.email ?? ''} readOnly />
                  </div>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <KeyRound className="mr-2 h-5 w-5" /> API Keys
                </CardTitle>
                <CardDescription>Manage your API keys for accessing the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeyRequestForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <KeyRound className="mr-2 h-5 w-5" /> OAuth Applications
                </CardTitle>
                <CardDescription>Manage your OAuth applications for user authentication.</CardDescription>
              </CardHeader>
              <CardContent>
                {actionStatus && (
                  <Alert variant={actionStatus.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                    {actionStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <AlertTitle>{actionStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>
                      {actionStatus.message}
                      {actionStatus.type === 'success' && actionStatus.newSecret && actionStatus.clientId && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-sm font-semibold">New Client Secret for ID {actionStatus.clientId}:</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm break-all">{actionStatus.newSecret}</span>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(actionStatus.newSecret!)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-red-600 mt-1">Save this secret. It will not be shown again.</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {isCreateFormVisible && (
                  <OAuthApplicationForm 
                    onSubmit={handleCreateSubmit as (data: CreateOAuthClientInput | UpdateOAuthClientInput) => Promise<void>} 
                    isLoading={isSubmittingForm}
                    submitButtonText="Create Application"
                    onCancel={handleCancelForm}
                    isEditMode={false}
                  />
                )}

                {editingClient && (
                  <OAuthApplicationForm 
                    initialData={{
                      client_id: editingClient.client_id,
                      client_name: editingClient.client_name ?? undefined,
                      client_uri: editingClient.client_uri ?? undefined,
                      logo_uri: editingClient.logo_uri ?? undefined,
                      tos_uri: editingClient.tos_uri ?? undefined,
                      policy_uri: editingClient.policy_uri ?? undefined,
                      client_type: editingClient.client_type,
                      redirect_uris: editingClient.redirect_uris ?? undefined,
                      grant_types: editingClient.grant_types ?? undefined,
                      response_types: editingClient.response_types ?? undefined,
                      scope: editingClient.scope ?? undefined,
                    }}
                    onSubmit={handleUpdateSubmit as (data: CreateOAuthClientInput | UpdateOAuthClientInput) => Promise<void>}
                    isLoading={isSubmittingForm}
                    submitButtonText="Save Changes"
                    onCancel={handleCancelForm}
                    isEditMode={true}
                  />
                )}

                {!editingClient && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-2">Your OAuth Applications:</h4>
                    {!isLoadingClients && !clientsError && oauthClients.length > 0 && (
                      <ul className="space-y-2">
                        {oauthClients.map((client) => (
                          <li key={client.client_id} className="p-3 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-semibold">{client.client_name || 'Unnamed Application'}</span>
                                <span className="text-xs text-muted-foreground ml-2">(ID: {client.client_id})</span>
                              </div>
                              <div className="flex space-x-1">
                                <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                                  <Pencil className="h-3 w-3 mr-1 lg:mr-2" /> <span className="hidden lg:inline">Edit</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleResetClientSecret(client.client_id, client.client_name || 'Unnamed Client') } className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700">
                                  <RefreshCw className="h-3 w-3 mr-1 lg:mr-2" /> <span className="hidden lg:inline">Reset Secret</span>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.client_id, client.client_name || 'Unnamed Client')}>
                                  <Trash2 className="h-3 w-3 mr-1 lg:mr-2" /> <span className="hidden lg:inline">Delete</span>
                                </Button>
                              </div>
                            </div>
                            {client.client_type && <p className="text-xs text-muted-foreground">Type: {client.client_type}</p>}
                            {client.redirect_uris && client.redirect_uris.length > 0 && <p className="text-xs text-muted-foreground">Redirects: {client.redirect_uris.join(', ')}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {(isLoadingClients || (!clientsError && oauthClients.length === 0)) && !isLoadingClients && (
                        <p>You haven't created any OAuth applications yet.</p>
                    )}
                     {isLoadingClients && <p>Loading clients...</p>}
                     {clientsError && <p className="text-red-500">Error: {clientsError}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apiExplorer" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Explorer (Interactive)</CardTitle>
                <CardDescription>Explore and test the API endpoints directly. Requests will use your current session.</CardDescription>
              </CardHeader>
              <CardContent>
                {openApiSpecObject ? (
                  <SwaggerUI spec={openApiSpecObject} />
                ) : (
                  <p>Loading API documentation...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation Resources</CardTitle>
                <CardDescription>Links to detailed guides and API references.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">Our detailed documentation covers everything you need to know...</p>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* TODO: Populate with actual links or components */}
                   <div className="rounded-lg border p-4">
                     <h3 className="font-medium mb-2">Getting Started</h3>
                     <p className="text-sm text-muted-foreground mb-4">Learn the basics...</p>
                     <Link href="/developers/documentation#getting-started" target="_blank"><Button variant="outline" size="sm">View Section</Button></Link>
                   </div>
                   {/* ... other links ... */}
                 </div>
                 <Link href="/developers/documentation" target="_blank" rel="noopener noreferrer">
                   <Button variant="default" className="mt-4">
                     <ExternalLink className="mr-2 h-4 w-4" /> View Full Documentation
                   </Button>
                 </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>See how to integrate the API into your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">Explore code examples...</p>
                <CodeExampleTabs />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apiChat" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Chat Helper</CardTitle>
                <CardDescription>
                  Ask questions about how to use the API. The assistant has access to the API's OpenAPI specification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingSpec && <p>Loading API specification for chat...</p>}
                {chatError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Chat Error</AlertTitle>
                    <AlertDescription>{chatError.message}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col h-[500px] border rounded-md p-4 space-y-4">
                  <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {messages.map(m => (
                      <div key={m.id} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground self-end ml-auto' : 'bg-muted self-start mr-auto'} max-w-[85%]`}>
                        <span className="text-xs text-muted-foreground">{m.role === 'user' ? 'You' : 'API Assistant'}</span>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        {m.createdAt && <p className="text-xs text-muted-foreground/70 pt-1">{m.createdAt.toLocaleTimeString()}</p>}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleChatSubmit} className="flex items-center gap-2 border-t pt-4">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder={isFetchingSpec ? "Waiting for API spec..." : "Ask about the API..."}
                      className="flex-grow"
                      disabled={isFetchingSpec || isChatLoading}
                    />
                    <Button type="submit" disabled={isFetchingSpec || isChatLoading || !input.trim()}>
                      {isChatLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </form>
                </div>
                {messages.length > 1 && (
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={() => reload({ data: { openApiSpec: openApiSpecForChat }})} disabled={isChatLoading}>
                            <RefreshCw className="mr-2 h-4 w-4"/> Regenerate
                        </Button>
                        <Button variant="outline" onClick={stop} disabled={!isChatLoading}>
                            Stop
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 