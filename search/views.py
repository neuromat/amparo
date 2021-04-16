from django.shortcuts import render


def findresults(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        busca = request.POST['busca']
        return render(request, 'search/results.html', {'busca_ret': busca})
    else:
        # Has not followed this flow
        return

