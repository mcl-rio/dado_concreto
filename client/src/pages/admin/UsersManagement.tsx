import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar,
  Shield,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  X,
  Search,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";

type UserRole = "pesquisador" | "diretor" | "administrador";

interface UserData {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  validUntil: Date | null;
  isActive: boolean;
  analysisQuota: number;
  analysisUsed: number;
  createdAt: Date;
}

interface InvitedUserData {
  id: number;
  email: string;
  role: UserRole;
  validUntil: Date | null;
  isActive: boolean;
  analysisQuota: number;
  createdAt: Date;
}

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'administrador';
  
  // State for dialogs
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editInviteDialogOpen, setEditInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<InvitedUserData | null>(null);
  
  // State for invite form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteValidUntil, setInviteValidUntil] = useState("");
  const [inviteQuota, setInviteQuota] = useState("5");
  const [inviteRole, setInviteRole] = useState<UserRole>("pesquisador");
  
  // State for edit user form
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("pesquisador");
  const [editValidUntil, setEditValidUntil] = useState("");
  const [editQuota, setEditQuota] = useState("5");
  const [editIsActive, setEditIsActive] = useState(true);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  
  // Queries
  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = trpc.admin.getUsers.useQuery();
  const { data: invitedUsers, isLoading: loadingInvited, refetch: refetchInvited } = trpc.admin.getInvitedUsers.useQuery();
  
  // Mutations
  const inviteUser = trpc.admin.inviteUser.useMutation({
    onSuccess: () => {
      toast.success("Convite enviado com sucesso!");
      setInviteDialogOpen(false);
      resetInviteForm();
      refetchInvited();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar convite");
    }
  });
  
  const updateUser = trpc.admin.updateUserAccess.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      setEditUserDialogOpen(false);
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar usuário");
    }
  });
  
  const deleteInvite = trpc.admin.deleteInvitedUser.useMutation({
    onSuccess: () => {
      toast.success("Convite removido com sucesso!");
      refetchInvited();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover convite");
    }
  });
  
  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário removido com sucesso!");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover usuário");
    }
  });
  
  // Helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return "Sem limite";
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const isExpired = (date: Date | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };
  
  const resetInviteForm = () => {
    setInviteName("");
    setInviteEmail("");
    setInviteValidUntil("");
    setInviteQuota("5");
    setInviteRole("pesquisador");
  };
  
  const openEditUserDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role);
    setEditValidUntil(user.validUntil ? new Date(user.validUntil).toISOString().split('T')[0] : "");
    setEditQuota(user.analysisQuota.toString());
    setEditIsActive(user.isActive);
    setEditUserDialogOpen(true);
  };
  
  const openEditInviteDialog = (invite: InvitedUserData) => {
    setSelectedInvite(invite);
    setEditEmail(invite.email);
    setEditRole(invite.role);
    setEditValidUntil(invite.validUntil ? new Date(invite.validUntil).toISOString().split('T')[0] : "");
    setEditQuota(invite.analysisQuota.toString());
    setEditIsActive(invite.isActive);
    setEditInviteDialogOpen(true);
  };
  
  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast.error("Email é obrigatório");
      return;
    }
    
    await inviteUser.mutateAsync({
      name: inviteName || undefined,
      email: inviteEmail,
      validUntil: inviteValidUntil ? new Date(inviteValidUntil).toISOString() : undefined,
      analysisQuota: parseInt(inviteQuota) || 5,
      role: inviteRole
    });
  };
  
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    await updateUser.mutateAsync({
      userId: selectedUser.id,
      validUntil: editValidUntil ? new Date(editValidUntil).toISOString() : null,
      isActive: editIsActive,
      analysisQuota: parseInt(editQuota) || 5,
      name: editName || null,
      email: editEmail || null,
      role: editRole
    });
  };
  
  const handleToggleUserActive = async (userId: number, currentActive: boolean, validUntil: Date | null) => {
    await updateUser.mutateAsync({
      userId,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      isActive: !currentActive
    });
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'administrador': return 'bg-red-500 text-white';
      case 'diretor': return 'bg-blue-500 text-white';
      case 'pesquisador': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };
  
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'administrador': return 'Administrador';
      case 'diretor': return 'Diretor';
      case 'pesquisador': return 'Pesquisador';
      default: return role;
    }
  };
  
  // Filter users
  const filteredUsers = users?.filter(u => {
    const matchesSearch = !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && u.isActive) ||
      (filterStatus === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];
  
  const filteredInvites = invitedUsers?.filter(u => {
    const matchesSearch = !searchTerm || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && u.isActive) ||
      (filterStatus === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div></div>
        <Button 
          onClick={() => setInviteDialogOpen(true)}
          className="bg-[var(--fgv-aux-yellow-2)] text-[var(--fgv-primary-1)] hover:bg-[var(--fgv-aux-yellow-1)]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Convidar Usuário
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Usuários Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {users?.filter(u => u.isActive).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Usuários Inativos</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {users?.filter(u => !u.isActive).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Convites Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {invitedUsers?.filter(u => u.isActive).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl text-fgv-blue">
              {(users?.length || 0) + (invitedUsers?.length || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={(v) => setFilterRole(v as UserRole | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="pesquisador">Pesquisador</SelectItem>
                <SelectItem value="diretor">Diretor</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as "all" | "active" | "inactive")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Users Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="bg-white/95">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários Cadastrados ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="invited" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Convites Pendentes ({filteredInvites.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>
                Usuários que já fizeram login no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-fgv-blue/10 flex items-center justify-center">
                          <span className="text-fgv-blue font-semibold">
                            {u.name?.charAt(0) || u.email?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{u.name || 'Sem nome'}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(u.role)}`}>
                              {getRoleLabel(u.role)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Válido até: {formatDate(u.validUntil)}
                              {isExpired(u.validUntil) && (
                                <span className="text-red-500 ml-1">(Expirado)</span>
                              )}
                            </span>
                            <span>Quota: {u.analysisUsed}/{u.analysisQuota}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {u.isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {u.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditUserDialog(u)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {u.role !== 'administrador' && (
                          <Switch
                            checked={u.isActive}
                            onCheckedChange={() => handleToggleUserActive(u.id, u.isActive, u.validUntil)}
                          />
                        )}
                        
                        {u.email !== 'marlos@marlos.com.br' && u.id !== currentUser?.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja deletar o usuário ${u.name || u.email}? Esta ação não pode ser desfeita.`)) {
                                deleteUser.mutate({ userId: u.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Invites Tab */}
        <TabsContent value="invited" className="mt-4">
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>
                Emails convidados que ainda não fizeram login
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvited ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-fgv-blue" />
                </div>
              ) : filteredInvites.length > 0 ? (
                <div className="space-y-3">
                  {filteredInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{invite.email}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(invite.role)}`}>
                              {getRoleLabel(invite.role)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Válido até: {formatDate(invite.validUntil)}
                              {isExpired(invite.validUntil) && (
                                <span className="text-red-500 ml-1">(Expirado)</span>
                              )}
                            </span>
                            <span>Quota: {invite.analysisQuota}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {invite.isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {invite.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditInviteDialog(invite)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteInvite.mutate({ id: invite.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum convite pendente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            <DialogDescription>
              Cadastre um novo usuário para acessar o sistema. Após o cadastro, o usuário poderá entrar diretamente com o email cadastrado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Nome</Label>
                <Input
                  id="invite-name"
                  type="text"
                  placeholder="Nome do usuário (opcional)"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-role">Tipo de Usuário</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pesquisador">Pesquisador (apenas análises)</SelectItem>
                  <SelectItem value="diretor">Diretor (gerencia usuários e conselheiros)</SelectItem>
                  {isAdmin && <SelectItem value="administrador">Administrador (acesso total)</SelectItem>}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {inviteRole === 'pesquisador' && 'Pesquisadores podem apenas criar e visualizar análises'}
                {inviteRole === 'diretor' && 'Diretores podem gerenciar usuários e conselheiros'}
                {inviteRole === 'administrador' && 'Administradores têm acesso total ao sistema'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invite-valid">Válido até</Label>
                <Input
                  id="invite-valid"
                  type="date"
                  value={inviteValidUntil}
                  onChange={(e) => setInviteValidUntil(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invite-quota">Quota de Pesquisas</Label>
                <Input
                  id="invite-quota"
                  type="number"
                  min="0"
                  value={inviteQuota}
                  onChange={(e) => setInviteQuota(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleInviteUser}
              disabled={inviteUser.isPending}
            >
              {inviteUser.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário. Todas as alterações serão salvas imediatamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-base font-semibold">Nome</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome do usuário"
                  className="h-11 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-base font-semibold">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  disabled
                  className="h-11 text-base bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email não pode ser alterado</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-base font-semibold">Tipo de Usuário</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger className="h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pesquisador">Pesquisador (apenas análises)</SelectItem>
                  <SelectItem value="diretor">Diretor (gerencia usuários e conselheiros)</SelectItem>
                  {isAdmin && <SelectItem value="administrador">Administrador (acesso total)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-valid" className="text-base font-semibold">Válido até</Label>
                <Input
                  id="edit-valid"
                  type="date"
                  value={editValidUntil}
                  onChange={(e) => setEditValidUntil(e.target.value)}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">Deixe em branco para acesso ilimitado</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-quota" className="text-base font-semibold">Quota de Pesquisas</Label>
                <Input
                  id="edit-quota"
                  type="number"
                  min="0"
                  value={editQuota}
                  onChange={(e) => setEditQuota(e.target.value)}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">Número máximo de análises permitidas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="edit-active" className="text-base font-semibold">Usuário Ativo</Label>
                <p className="text-xs text-muted-foreground">Desative para bloquear o acesso do usuário</p>
              </div>
              <Switch
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUser.isPending}
              className="bg-[var(--fgv-primary-2)] hover:bg-[var(--fgv-primary-1)]"
            >
              {updateUser.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
