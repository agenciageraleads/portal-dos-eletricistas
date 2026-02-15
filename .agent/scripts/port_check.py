#!/usr/bin/env python3
import socket
import sys

def check_port(port):
    """Verifica se uma porta está sendo usada."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    # Portas padrão para os apps do monorepo (Web, API, etc.)
    ports_to_check = [3000, 3001, 3002, 4000, 5000, 5432, 6379]
    
    # Se passarem portas via argumento, usa elas
    if len(sys.argv) > 1:
        try:
            ports_to_check = [int(p) for p in sys.argv[1:] if p.isdigit()]
        except:
            pass

    print(f"--- Verificando disponibilidade de portas ---")
    busy_ports = []
    for port in ports_to_check:
        if check_port(port):
            busy_ports.append(port)
            print(f"⚠️  Porta {port}: EM USO")
        else:
            print(f"✅ Porta {port}: DISPONÍVEL")

    if busy_ports:
        print(f"\nAVISO: {len(busy_ports)} porta(s) estão em uso. Verifique se há outros apps rodando.")
        # Retorna 0 (sucesso) porque é apenas um aviso informativo, 
        # a menos que queiramos bloquear o deploy se as portas estiverem ocupadas.
        # Como o usuário quer VALIDAR se estão disponíveis, vamos apenas avisar.
        sys.exit(0)
    else:
        print("\n✨ Todas as portas verificadas estão disponíveis.")
        sys.exit(0)

if __name__ == "__main__":
    main()
