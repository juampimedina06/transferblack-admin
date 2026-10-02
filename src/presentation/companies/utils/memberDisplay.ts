import type { CorporateMember } from '../../../core/companies/companyMembers.api';

// Compartido entre `MembersTable` y `EditMemberModal`: antes vivia duplicado
// en la tabla y el nuevo modal de edicion se hubiera desincronizado del rotulo
// apenas cambiara uno de los dos ("Gerente" vs "Encargado", por ejemplo).
export const roleLabel: Record<string, string> = { manager: 'Encargado', employee: 'Empleado' };

export function memberName(member: CorporateMember): string {
  const name = [member.first_name, member.last_name].filter(Boolean).join(' ').trim();
  return name || `Perfil ${member.profile_id.slice(0, 8)}…`;
}
