import json
import sys

def analyze_har(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            har_data = json.load(f)
        
        entries = har_data.get('log', {}).get('entries', [])
        failed_requests = []

        print(f"Total entries: {len(entries)}")

        for entry in entries:
            response = entry.get('response', {})
            status = response.get('status', 0)
            if status >= 400:
                request = entry.get('request', {})
                url = request.get('url', '')
                try:
                    text = response.get('content', {}).get('text', '')
                    if text and len(text) > 200:
                         text = text[:200] + "..."
                except:
                    text = "Could not read content"
                
                failed_requests.append({
                    'status': status,
                    'statusText': response.get('statusText', ''),
                    'url': url,
                    'method': request.get('method', ''),
                    'response_snippet': text
                })

        if not failed_requests:
            print("No failed requests found (status >= 400).")
        else:
            print(f"Found {len(failed_requests)} failed requests:")
            for req in failed_requests:
                print("-" * 40)
                print(f"Method: {req['method']}")
                print(f"URL: {req['url']}")
                print(f"Status: {req['status']} {req['statusText']}")
                print(f"Response: {req['response_snippet']}")

    except Exception as e:
        print(f"Error analyzing HAR file: {e}")

if __name__ == "__main__":
    analyze_har('beta.portaleletricos.com.br.har')
