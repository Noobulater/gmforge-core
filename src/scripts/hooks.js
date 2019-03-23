hook = {
    _hooks:{},
    _calledHooks:{},
    add:function(name,uniq,func)
    {
        hook._hooks[name] = hook._hooks[name] || {};
        hook._hooks[name][uniq] = func;
    },
    call:function(name,...args)
    {
        var returns = true;
        hook._calledHooks[name] = true;
        if(hook._hooks[name])
        {
            for(var uniq in hook._hooks[name])
            {
                var ret = hook._hooks[name][uniq](...args);
                if(ret === false)
                {
                    returns = false;
                }
            }
        }
        return returns
    },
    remove:function(name,uniq)
    {
        if(hook._hooks[name])
        {
            delete hook._hooks[name][uniq]
        }
    }

}
