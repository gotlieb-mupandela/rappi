param(
  [int]$Start = 0,
  [int]$End = 47
)

$ErrorActionPreference = 'Stop'
Set-Location "D:\Projects\rappi-webapp"

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class CredMan {
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL {
    public int Flags; public int Type; public string TargetName; public string Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten; public int CredentialBlobSize;
    public IntPtr CredentialBlob; public int Persist; public int AttributeCount; public IntPtr Attributes;
    public string TargetAlias; public string UserName;
  }
  [DllImport("advapi32", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
  [DllImport("advapi32")] public static extern void CredFree(IntPtr cred);
  public static string ReadPassword(string target) {
    IntPtr nCredPtr;
    if (!CredRead(target, 1, 0, out nCredPtr)) return null;
    var cred = (CREDENTIAL)Marshal.PtrToStructure(nCredPtr, typeof(CREDENTIAL));
    if (cred.CredentialBlobSize <= 0) { CredFree(nCredPtr); return null; }
    var bytes = new byte[cred.CredentialBlobSize];
    Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
    CredFree(nCredPtr);
    return Encoding.Unicode.GetString(bytes);
  }
}
"@

$token = [CredMan]::ReadPassword("Supabase CLI:supabase")
if (-not $token) { throw "Missing Supabase CLI token in credential manager" }

$env:SUPABASE_ACCESS_TOKEN = $token
$env:SUPABASE_PROJECT_REF = 'wzmzwerzbyudcvoiiege'

node "tmp/catalog-sync/apply-range.mjs" $Start $End
